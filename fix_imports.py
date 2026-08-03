import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Find matches like: import { Medicine, Inventory } from "@/models";
    # We'll use a regex to find all such imports
    pattern = re.compile(r'import\s+\{([^}]+)\}\s+from\s+["\']@/models["\'];?', re.MULTILINE)
    
    def replacer(match):
        imports = match.group(1).split(',')
        new_lines = []
        for imp in imports:
            imp = imp.strip()
            if not imp:
                continue
            
            # If it's a specific enum related to a model, we might need to map it.
            # E.g. LogStage -> VerificationLog, MedicineStatus -> Medicine, InventoryStatus -> Inventory
            # DistributionRecipient, DistributionStatus -> Distribution
            # NotificationType -> Notification
            # CorrectionType -> AILearningDataset
            # VolunteerStatus -> Volunteer
            
            mapping = {
                'MedicineStatus': 'Medicine',
                'InventoryStatus': 'Inventory',
                'LogStage': 'VerificationLog',
                'LogStatus': 'VerificationLog',
                'DistributionRecipient': 'Distribution',
                'DistributionStatus': 'Distribution',
                'NotificationType': 'Notification',
                'CorrectionType': 'AILearningDataset',
                'VolunteerStatus': 'Volunteer'
            }
            
            model_file = mapping.get(imp, imp)
            new_lines.append(f'import {{ {imp} }} from "@/models/{model_file}";')
            
        return '\n'.join(new_lines)
    
    new_content = pattern.sub(replacer, content)
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Fixed {filepath}")

for root, dirs, files in os.walk('.'):
    if 'node_modules' in root or '.next' in root:
        continue
    for file in files:
        if file.endswith('.ts') or file.endswith('.tsx'):
            if file == 'index.ts' and 'models' in root:
                continue
            process_file(os.path.join(root, file))
