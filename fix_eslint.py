import json
import re

with open('eslint-report.json') as f:
    report = json.load(f)

for file_result in report:
    filepath = file_result['filePath']
    messages = file_result.get('messages', [])
    
    if not messages:
        continue
        
    try:
        with open(filepath, 'r') as f:
            lines = f.readlines()
    except Exception as e:
        continue
        
    changed = False
    
    # Sort messages in reverse order of line number so that line removals don't mess up subsequent indices
    for msg in sorted(messages, key=lambda x: x['line'], reverse=True):
        line_idx = msg['line'] - 1
        rule = msg.get('ruleId')
        message = msg.get('message', '')
        
        if rule == '@typescript-eslint/no-explicit-any':
            lines[line_idx] = re.sub(r'\bany\b', 'unknown', lines[line_idx])
            changed = True
        elif rule == '@typescript-eslint/ban-ts-comment':
            lines[line_idx] = ""
            changed = True
        elif 'Unused eslint-disable directive' in message:
            lines[line_idx] = ""
            changed = True
            
    if changed:
        with open(filepath, 'w') as f:
            f.writelines(lines)
            print(f"Fixed {filepath}")
