#!/bin/bash

# Code Splitting Conversion Helper Script
# This script helps identify pages that need conversion

echo "🔍 Finding pages that need code splitting conversion..."
echo ""

# Find all page.tsx files
find app/\(protected\) -name "page.tsx" -type f | while read -r page_file; do
  # Skip if already has dynamic import
  if grep -q "dynamic.*from.*next/dynamic" "$page_file" 2>/dev/null; then
    continue
  fi
  
  # Check if it's a heavy page (has useReactTable, TableComp, or complex state)
  if grep -qE "(useReactTable|TableComp|useState.*\[\]|useEffect)" "$page_file" 2>/dev/null; then
    # Check if content file already exists
    dir=$(dirname "$page_file")
    base_name=$(basename "$dir")
    content_file="${dir}/${base_name}-content.tsx"
    
    if [ ! -f "$content_file" ]; then
      echo "📄 $page_file"
      echo "   → Needs: ${content_file}"
      echo ""
    fi
  fi
done

echo "✅ Scan complete!"
echo ""
echo "To convert a page:"
echo "1. Create {name}-content.tsx with all heavy logic"
echo "2. Update page.tsx to lightweight wrapper with dynamic import"
echo "3. Use PageSkeleton for loading state"
echo "4. Set ssr: false for client-heavy components"

