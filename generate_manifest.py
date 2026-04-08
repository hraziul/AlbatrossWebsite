import subprocess
import json
import os

ENDPOINT = "https://0a9d02a9298867aeca97a48c932d174d.r2.cloudflarestorage.com"
BUCKET   = "albatross-views"
OUTPUT   = "data/views-manifest.json"

ALBUMS = [
    ("Bedni Bugyal",                     "bedni-bugyal"),
    ("Bhutan",                           "bhutan"),
    ("Center-ing Europe",                "centering-europe"),
    ("Corbett",                          "corbett"),
    ("Denmark",                          "denmark"),
    ("Derwentwater",                     "derwentwater"),
    ("Dudhwa",                           "dudhwa"),
    ("EBC 2017",                         "ebc-2017"),
    ("Experience United Kingdom",        "experience-uk"),
    ("Ibiza",                            "ibiza"),
    ("Into Darkness (astrophotography)", "into-darkness"),
    ("Kheerganga",                       "kheerganga"),
    ("Lake Vyrnwy",                      "lake-vyrnwy"),
    ("Lakshadweep",                      "lakshadweep"),
    ("Llansteffan",                      "llansteffan"),
    ("Lunar scope",                      "lunar-scope"),
    ("Meghalaya",                        "meghalaya"),
    ("Munsiyari",                        "munsiyari"),
    ("Other shots",                      "other-shots"),
    ("Oxfam Women Lifeline Photo story", "oxfam-women-lifeline"),
    ("Pen y Fan",                        "pen-y-fan"),
    ("Pune & Cochin",                    "pune-cochin"),
    ("Rajasthan",                        "rajasthan"),
    ("Shimla-Ladakh",                    "shimla-ladakh"),
    ("The Eagle Nest",                   "eagle-nest"),
    ("Triund-Snowline(2017)",            "triund-snowline"),
    ("Ty Cipar",                         "ty-cipar"),
    ("Zoo Day",                          "zoo-day"),
]

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".JPG", ".JPEG", ".PNG"}

def list_folder(folder_name):
    result = subprocess.run(
        [
            "aws", "s3", "ls",
            f"s3://{BUCKET}/{folder_name}/",
            "--endpoint-url", ENDPOINT
        ],
        capture_output=True,
        text=True
    )
    keys = []
    for line in result.stdout.strip().split("\n"):
        parts = line.split()
        if len(parts) < 4:
            continue
        filename = " ".join(parts[3:])
        _, ext = os.path.splitext(filename)
        if ext in IMAGE_EXTS:
            keys.append(f"{folder_name}/{filename}")
    return sorted(keys)

def main():
    manifest = {}
    total = 0

    for folder_name, slug in ALBUMS:
        print(f"  Scanning: {folder_name}...", end=" ", flush=True)
        keys = list_folder(folder_name)
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