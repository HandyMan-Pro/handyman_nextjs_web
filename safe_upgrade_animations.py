import re

filepath = 'src/app/page.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Add framer-motion import
if "from 'framer-motion'" not in content:
    content = content.replace(
        "import { useRouter } from 'next/navigation';",
        "import { useRouter } from 'next/navigation';\nimport { motion } from 'framer-motion';"
    )

sections = [
    '<section id="home"',
    '<section className="py-10 px-4 md:px-12 bg-white dark:bg-zinc-900 border-y',
    '<section id="categories"',
    '<section id="services"',
    '<section className="py-16 px-4 md:px-12 bg-white dark:bg-zinc-900 transition-colors duration-300"',
    '<section className="py-24 px-4 md:px-12 bg-slate-50 dark:bg-zinc-950 transition-colors duration-300 relative overflow-hidden"',
    '<section id="shops"',
    '<section id="download"'
]

# We will find the exact start and end of these sections.
# In JSX, these sections are siblings under `<main className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">`
# Let's verify if they are siblings. Yes, they are.
# So we can just split the file by `<section` and `</section>` but it's tricky.
# Instead, since we know they are all before the Footer (which might be another section or footer tag),
# let's just do simple replacements.

for sec_prefix in sections:
    # Find the section start
    idx = content.find(sec_prefix)
    if idx == -1:
        continue
    
    # We found a section. Let's find its matching </section>
    # We keep a counter of <section> vs </section>
    depth = 0
    i = idx
    while i < len(content):
        if content[i:].startswith('<section'):
            depth += 1
            i += 8
        elif content[i:].startswith('</section>'):
            depth -= 1
            if depth == 0:
                # We found the matching closing tag!
                # Replace the closing tag first
                content = content[:i] + '</motion.section>' + content[i+10:]
                break
            i += 10
        else:
            i += 1
            
    # Now replace the opening tag
    if sec_prefix == '<section id="home"':
        content = content[:idx] + content[idx:].replace('<section', '<motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}', 1)
    else:
        content = content[:idx] + content[idx:].replace('<section', '<motion.section initial={{ opacity: 0, y: 60, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }}', 1)

with open(filepath, 'w') as f:
    f.write(content)

print("Safely added Framer Motion animations.")
