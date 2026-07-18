import os

filepath = 'src/app/page.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Replace basic animations with ultra premium ones

# Find the specific motion.section string we injected earlier
old_anim = 'initial={{ opacity: 0, y: 60, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }}'
new_anim = 'initial={{ opacity: 0, y: 100, scale: 0.95, filter: "blur(15px)" }} whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 1.2, type: "spring", bounce: 0.2 }}'

content = content.replace(old_anim, new_anim)

# For the Hero section, let's also make it ultra premium on mount
old_hero_anim = 'initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}'
new_hero_anim = 'initial={{ opacity: 0, y: 40, scale: 0.98, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}'

content = content.replace(old_hero_anim, new_hero_anim)

with open(filepath, 'w') as f:
    f.write(content)

print("Upgraded to ultra premium animations.")
