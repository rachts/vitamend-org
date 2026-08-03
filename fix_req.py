import os

files_to_fix = [
    ('/Volumes/Rachit 32 GB/vitamend/app/api/analytics/route.ts', 'req', '_req'),
    ('/Volumes/Rachit 32 GB/vitamend/app/api/dashboard/activity/route.ts', 'req', '_req'),
    ('/Volumes/Rachit 32 GB/vitamend/app/api/dashboard/stats/route.ts', 'req', '_req'),
    ('/Volumes/Rachit 32 GB/vitamend/app/api/inventory/alerts/route.ts', 'req', '_req'),
    ('/Volumes/Rachit 32 GB/vitamend/app/api/notifications/route.ts', 'req', '_req'),
]

for filepath, old, new_val in files_to_fix:
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Simple replacement of 'req: NextRequest' to '_req: NextRequest'
    content = content.replace('req: NextRequest', '_req: NextRequest')
    content = content.replace('req: Request', '_req: Request')
    
    with open(filepath, 'w') as f:
        f.write(content)
        
print("Fixed API routes")
