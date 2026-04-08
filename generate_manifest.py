import boto3
import json
import os
from botocore.config import Config

# ── CONFIG ──────────────────────────────────────────────────────────────────
ENDPOINT   = "https://0a9d02a9298867aeca97a48c932d174d.r2.cloudflarestorage.com"
BUCKET     = "albatross-views"
ACCESS_KEY = "2fa1d25bc0d2bff70db9bfdc3b1ac087"
# Secret key pulled from environment variable — DO NOT hardcode
SECRET_KEY = os.environ.get("R2_SECRET_KEY")
OUTPUT     = "data/views-manifest.json"

# ── FOLDER → SLUG MAP (28 albums, exact R2 casing) ──────────────────────────
ALBUMS = [
    ("Bedni Bugyal",                        "bedni-bugyal"),
    ("Bhutan",                              "bhutan"),
    ("Center-ing Europe",                   "centering-europe"),
    ("Corbett",                             "corbett"),
    ("Denmark",                             "denmark"),
    ("Derwentwater",                        "derwentwater"),
    ("Dudhwa",                              "dudhwa"),
    ("EBC 2017",                            "ebc-2017"),
    ("Experience United Kingdom",           "experience-uk"),
    ("Ibiza",                               "ibiza"),
    ("Into Darkness (astrophotography)",    "into-darkness"),
    ("Kheerganga",                          "kheerganga"),
    ("Lake Vyrnwy",                         "lake-vyrnwy"),
    ("Lakshadweep",                         "lakshadweep"),
    ("Llansteffan",                         "llansteffan"),
    ("Lunar scope",                         "lunar-scope"),
    ("Meghalaya",                           "meghalaya"),
    ("Munsiyari",                           "munsiyari"),
    ("Other shots",                         "other-shots"),
    ("Oxfam Women Lifeline Photo story",    "oxfam-women-lifeline"),
    ("Pen y Fan",                           "pen-y-fan"),
    ("Pune & Cochin",                       "pune-cochin"),
    ("Rajasthan",                           "rajasthan"),
    ("Shimla-Ladakh",                       "shimla-ladakh"),
    ("The Eagle Nest",                      "eagle-nest"),
    ("Triund-Snowline(2017)",               "triund-snowline"),
    ("Ty Cipar",                            "ty-cipar"),
    ("Zoo Day",                             "zoo-day"),
]

# ── ALLOWED EXTENSIONS ───────────────────────────────────────────────────────
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".JPG", ".JPEG", ".PNG"}

def list_folder(client, folder_name):
    """Return sorted list of image object keys inside a folder prefix."""
    prefix = folder_name + "/"
    paginator = client.get_paginator("list_objects_v2")
    keys = []
    for page in paginator.paginate(Bucket=BUCKET, Prefix=prefix):
        for obj in page.get("Contents", []):
            key = obj["Key"]
            _, ext = os.path.splitext(key)
            if ext in IMAGE_EXTS:
                keys.append(key)
    keys.sort()
    return keys

def main():
    if not SECRET_KEY:
        raise EnvironmentError(
            "R2_SECRET_KEY environment variable not set.\n"
            "Run: export R2_SECRET_KEY='your_secret_key_here'"
        )

    client = boto3.client(
        "s3",
        endpoint_url=ENDPOINT,
        aws_access_key_id=ACCESS_KEY,
        aws_secret_access_key=SECRET_KEY,
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )

    manifest = {}
    total = 0

    for folder_name, slug in ALBUMS:
        print(f"  Scanning: {folder_name}...", end=" ", flush=True)
        keys = list_folder(client, folder_name)
        manifest[slug] = [{"path": k} for k in keys]
        count = len(keys)
        total += count
        print(f"{count} images")

    os.makedirs("data", exist_ok=True)
    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    print(f"\n✅ Manifest written to {OUTPUT}")
    print(f"   Total images indexed: {total}")
    print(f"   Albums: {len(manifest)}")

if __name__ == "__main__":
    main()