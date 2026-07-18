import re

def update_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Fix card background in src/app/categories/page.tsx
    content = content.replace(
        'bg-white/60 dark:bg-[#121217]/80',
        'bg-white/50 dark:bg-white/5'
    )

    with open(filepath, 'w') as f:
        f.write(content)

update_file('src/app/categories/page.tsx')

print("Fixed card background.")
