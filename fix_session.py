import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Replace import { getServerSession } from "next-auth" or "next-auth/next"
    # and import { authOptions } from "@/lib/auth"
    # with import { auth } from "@/auth"
    
    # Remove authOptions imports
    content = re.sub(r'import\s+\{\s*authOptions\s*\}\s+from\s+["\']@/lib/auth["\'];?\n?', '', content)
    
    # Replace getServerSession import
    content = re.sub(r'import\s+\{\s*getServerSession\s*\}\s+from\s+["\']next-auth(/next)?["\'];?\n?', 'import { auth } from "@/auth";\n', content)
    
    # 2. Replace await getServerSession(authOptions) with await auth()
    content = re.sub(r'getServerSession\s*\(\s*(authOptions)?\s*\)', 'auth()', content)
    
    with open(filepath, 'w') as f:
        f.write(content)

for root, dirs, files in os.walk('.'):
    if 'node_modules' in root or '.next' in root:
        continue
    for file in files:
        if file.endswith('.ts') or file.endswith('.tsx'):
            if file == 'auth.ts':
                continue
            process_file(os.path.join(root, file))
