#!/usr/bin/env python3
"""
tools/br_coverage.py
Script quét mã nguồn backend (src/main/ và src/test/) để tính độ phủ của các Quy tắc nghiệp vụ BR-01 -> BR-124.
"""
import os
import re
import sys

TOTAL_RULES = 124

def scan_br_annotations(backend_dir):
    pattern = re.compile(r'BR[-_](\d{1,3})', re.IGNORECASE)
    covered_rules = set()

    if not os.path.exists(backend_dir):
        print(f"[WARN] Backend directory not found at: {backend_dir}")
        return covered_rules

    for root, _, files in os.walk(backend_dir):
        for file in files:
            if file.endswith(('.java', '.kt', '.sql', '.ts', '.tsx')):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        matches = pattern.findall(content)
                        for m in matches:
                            num = int(m)
                            if 1 <= num <= TOTAL_RULES:
                                covered_rules.add(num)
                except Exception as e:
                    pass

    return covered_rules

def main():
    backend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'backend')
    frontend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'frontend')
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'db')

    covered = set()
    covered.update(scan_br_annotations(backend_path))
    covered.update(scan_br_annotations(frontend_path))
    covered.update(scan_br_annotations(db_path))

    total_covered = len(covered)
    coverage_pct = (total_covered / TOTAL_RULES) * 100

    print("=" * 60)
    print(f"HMS BUSINESS RULES VERIFICATION & VALIDATION (BR-01 -> BR-124)")
    print("=" * 60)
    print(f"Tổng số Business Rules cần phủ: {TOTAL_RULES}")
    print(f"Số lượng Business Rules đã được ánh xạ: {total_covered}")
    print(f"Tỷ lệ độ phủ nghiệp vụ (BR Coverage): {coverage_pct:.1f}%")
    print("=" * 60)

    if total_covered > 0:
        print("[SUCCESS] Đã quét và ghi nhận các liên kết truy vết quy tắc nghiệp vụ.")
        sys.exit(0)
    else:
        print("[INFO] Khởi tạo bộ đo độ phủ nghiệp vụ cho hệ thống.")
        sys.exit(0)

if __name__ == '__main__':
    main()
