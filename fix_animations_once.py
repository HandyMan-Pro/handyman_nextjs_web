import os

filepath = 'src/app/page.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Replace `once: true` with `once: false` in the viewport config
old_anim = 'viewport={{ once: true, amount: 0.15 }}'
new_anim = 'viewport={{ once: false, amount: 0.15 }}'

content = content.replace(old_anim, new_anim)

with open(filepath, 'w') as f:
    f.write(content)

print("Changed viewport to trigger every time (once: false).")
