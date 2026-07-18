import re

filepath = 'src/app/page.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# I want to add the public fetch for categories and services
# I can just add it right before setAuthLoading(false);

new_fetch_code = """
    apiClient.get('/categories').then(res => {
      if (Array.isArray(res.data) && res.data.length > 0) setCategories(res.data);
    }).catch(e => console.error("Error fetching categories", e));
    apiClient.get('/services').then(res => {
      if (Array.isArray(res.data) && res.data.length > 0) setServices(res.data);
    }).catch(e => console.error("Error fetching services", e));
    setAuthLoading(false);
"""

content = content.replace("setAuthLoading(false);\n    fetchProviders();\n    fetchServicesAndCategories();", new_fetch_code + "\n    fetchProviders();\n    fetchServicesAndCategories();")

with open(filepath, 'w') as f:
    f.write(content)

print("Added public catalog fetch to homepage.")
