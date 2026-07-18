import re

def update_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Add import
    if "import FrontendNavbar" not in content:
        content = content.replace(
            "import Link from 'next/link';",
            "import Link from 'next/link';\nimport FrontendNavbar from '../../components/FrontendNavbar';"
        ).replace(
            "import Image from 'next/image';",
            "import Image from 'next/image';\nimport FrontendNavbar from '../../../components/FrontendNavbar';"
        )

    # Remove old header
    if "<header" in content and "</header>" in content:
        start_idx = content.find("<header")
        end_idx = content.find("</header>") + 9
        old_header = content[start_idx:end_idx]
        content = content.replace(old_header, "<FrontendNavbar />")

    with open(filepath, 'w') as f:
        f.write(content)

update_file('src/app/categories/page.tsx')
update_file('src/app/categories/[name]/page.tsx')

print("Updated pages to use FrontendNavbar.")
