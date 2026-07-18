import os

filepath = 'src/app/page.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Add framer-motion import
if "from 'framer-motion'" not in content:
    content = content.replace(
        "import { useRouter } from 'next/navigation';",
        "import { useRouter } from 'next/navigation';\nimport { motion } from 'framer-motion';"
    )

# Section 1: Hero
content = content.replace(
    '<section id="home" className="relative py-12 md:py-24 px-4 md:px-12 overflow-hidden bg-[#0a0a0c] transition-colors duration-300">',
    '<motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} id="home" className="relative py-12 md:py-24 px-4 md:px-12 overflow-hidden bg-[#0a0a0c] transition-colors duration-300">'
)

# Other sections to animate on scroll
sections_to_animate = [
    '<section className="py-10 px-4 md:px-12 bg-white dark:bg-zinc-900 border-y border-slate-200/50 dark:border-zinc-800 transition-colors duration-300">',
    '<section id="categories" className="py-16 px-4 md:px-12 bg-white dark:bg-zinc-900 transition-colors duration-300">',
    '<section id="services" className="py-16 px-4 md:px-12 bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">',
    '<section className="py-16 px-4 md:px-12 bg-white dark:bg-zinc-900 transition-colors duration-300">',
    '<section className="py-24 px-4 md:px-12 bg-slate-50 dark:bg-zinc-950 transition-colors duration-300 relative overflow-hidden">',
    '<section id="shops" className="py-16 px-4 md:px-12 bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">',
    '<section id="download" className="py-16 px-4 md:px-12 bg-white dark:bg-zinc-900 transition-colors duration-300">'
]

for old_sec in sections_to_animate:
    new_sec = old_sec.replace('<section', '<motion.section initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7, ease: "easeOut" }}')
    content = content.replace(old_sec, new_sec)

# Fix closing tags for the animated sections (only replacing up to the dashboard part, approx line 5000)
# Instead of replacing all </section>, I will replace </section> that match the landing page sections.
# But it's easier to just replace all `</section>` with `</motion.section>` for the landing page part.
# Landing page ends around line 4330.
landing_page_content = content[:4500]
dashboard_content = content[4500:]

# In landing page, we replace all </section> with </motion.section>
landing_page_content = landing_page_content.replace('</section>', '</motion.section>')

# Put it back together
content = landing_page_content + dashboard_content

with open(filepath, 'w') as f:
    f.write(content)

print("Added Framer Motion animations to sections.")
