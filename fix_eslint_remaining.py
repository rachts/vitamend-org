import re

# 1. lib/ai-verification-engine.ts
with open('lib/ai-verification-engine.ts', 'r') as f:
    lines = f.readlines()
with open('lib/ai-verification-engine.ts', 'w') as f:
    f.writelines(lines[:7] + lines[16:])

# 2. app/(public)/auth/signin/page.tsx
with open('app/(public)/auth/signin/page.tsx', 'r') as f:
    content = f.read()
content = content.replace("Don't", "Don&apos;t")
content = content.replace('Sign in to "VitaMend"', 'Sign in to &quot;VitaMend&quot;')
with open('app/(public)/auth/signin/page.tsx', 'w') as f:
    f.write(content)

# 3. app/(public)/founders/page.tsx
with open('app/(public)/founders/page.tsx', 'r') as f:
    content = f.read()
content = re.sub(r"(?<!&apos;)'(?!s\b|re\b|t\b|ve\b|m\b|ll\b|d\b)", "&apos;", content)
content = content.replace("'", "&apos;")
with open('app/(public)/founders/page.tsx', 'w') as f:
    f.write(content)

# 4. app/admin/analytics/page.tsx
with open('app/admin/analytics/page.tsx', 'r') as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if 'useState<any>(null)' in line:
        lines[i] = line.replace('useState<any>(null)', 'useState<unknown>(null)')
with open('app/admin/analytics/page.tsx', 'w') as f:
    f.writelines(lines)

# 5. lib/auth.ts
with open('lib/auth.ts', 'r') as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if 'eslint-disable' in line and 'interface AuthUser' in lines[min(i+1, len(lines)-1)]:
        lines[i] = ""
        lines[i+1] = lines[i+1].replace('AuthUser', '_AuthUser')
with open('lib/auth.ts', 'w') as f:
    f.writelines(lines)

# 6. app/(public)/donate/donation-form.tsx
with open('app/(public)/donate/donation-form.tsx', 'r') as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if 'forEach((file) =>' in line:
        lines[i] = line.replace('forEach((file) =>', 'forEach((_file) =>')
with open('app/(public)/donate/donation-form.tsx', 'w') as f:
    f.writelines(lines)

print("Fixed!")
