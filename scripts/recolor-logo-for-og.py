"""
OGP画像生成専用の、ロゴのクリーム色バージョンを作る一時ユーティリティ。

public/images/logo.png は暗い焦茶色のインクで描かれており、サイト本体では
CSSのmask機能で --ink（クリーム色 #f0ebe3）に塗り替えて暗色背景の上に
表示している（app/globals.css の .logo 参照）。

next/og の ImageResponse（Satori）は CSS の mask-image に対応していないため、
OGP画像生成側では同じ配色ルールをあらかじめ焼き込んだ別ファイルを用意する
必要がある。このスクリプトはその一度きりの変換を行うもので、アプリの
実行時には関与しない。

実行: python3 scripts/recolor-logo-for-og.py
出力: public/images/logo-og.png（透明部分はそのまま、インク部分だけ #f0ebe3 に置換）
"""

import struct
import zlib
from pathlib import Path

SRC = Path(__file__).resolve().parent.parent / "public/images/logo.png"
DST = Path(__file__).resolve().parent.parent / "public/images/logo-og.png"

# app/globals.css の --ink と同じ値
INK_R, INK_G, INK_B = 0xF0, 0xEB, 0xE3


def read_png(path):
    data = path.read_bytes()
    pos = 8
    idat = b""
    width = height = None
    while pos < len(data):
        length = struct.unpack(">I", data[pos : pos + 4])[0]
        ctype = data[pos + 4 : pos + 8]
        chunk = data[pos + 8 : pos + 8 + length]
        if ctype == b"IHDR":
            width, height, bitdepth, colortype = struct.unpack(">IIBB", chunk[:10])
            if bitdepth != 8 or colortype != 6:
                raise ValueError("8bit RGBA PNG のみ対応")
        elif ctype == b"IDAT":
            idat += chunk
        elif ctype == b"IEND":
            break
        pos += 8 + length + 4
    raw = zlib.decompress(idat)

    bpp = 4
    stride = width * bpp
    out = bytearray(stride * height)
    pos = 0
    prev = bytearray(stride)
    for y in range(height):
        filt = raw[pos]
        pos += 1
        line = bytearray(raw[pos : pos + stride])
        pos += stride
        for i in range(stride):
            a = line[i - bpp] if i >= bpp else 0
            b = prev[i]
            c = prev[i - bpp] if i >= bpp else 0
            if filt == 0:
                val = line[i]
            elif filt == 1:
                val = (line[i] + a) & 0xFF
            elif filt == 2:
                val = (line[i] + b) & 0xFF
            elif filt == 3:
                val = (line[i] + ((a + b) // 2)) & 0xFF
            elif filt == 4:
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                pr = a if pa <= pb and pa <= pc else (b if pb <= pc else c)
                val = (line[i] + pr) & 0xFF
            else:
                raise ValueError(f"未対応のフィルタ種別: {filt}")
            line[i] = val
        out[y * stride : (y + 1) * stride] = line
        prev = line
    return width, height, bytes(out)


def write_png(path, width, height, pixels):
    bpp = 4
    stride = width * bpp
    raw = bytearray()
    for y in range(height):
        raw.append(0)  # フィルタ種別0（none）で統一
        raw.extend(pixels[y * stride : (y + 1) * stride])
    compressed = zlib.compress(bytes(raw), 9)

    def chunk(ctype, payload):
        return (
            struct.pack(">I", len(payload))
            + ctype
            + payload
            + struct.pack(">I", zlib.crc32(ctype + payload) & 0xFFFFFFFF)
        )

    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", ihdr)
    png += chunk(b"IDAT", compressed)
    png += chunk(b"IEND", b"")
    path.write_bytes(png)


def main():
    width, height, pixels = read_png(SRC)
    out = bytearray(pixels)
    for i in range(0, len(out), 4):
        alpha = out[i + 3]
        if alpha > 0:
            out[i] = INK_R
            out[i + 1] = INK_G
            out[i + 2] = INK_B
            # アルファ値はそのまま維持（アンチエイリアスの縁を保持するため）
    write_png(DST, width, height, bytes(out))
    print(f"wrote {DST} ({width}x{height})")


if __name__ == "__main__":
    main()
