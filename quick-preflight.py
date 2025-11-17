#!/usr/bin/env python3
"""
Quick Preflight Script (Mock Implementation)

This is a simplified mock implementation for testing.
Replace with your actual preflight logic that uses Acrobat or other PDF tools.

Usage: python3 quick-preflight.py /path/to/folder
"""

import sys
import json
import os
from pathlib import Path


def analyze_pdf(pdf_path):
    """Mock PDF analysis. Replace with actual PDF preflight logic."""
    # In production, this would:
    # - Check PDF dimensions
    # - Verify DPI
    # - Check for 100% magenta
    # - Validate color spaces
    # - Check for bleed
    # etc.

    return {
        "status": "PASS",
        "file_name": os.path.basename(pdf_path),
        "pdf_width": 18.0,
        "pdf_height": 24.0,
        "dimension_match": True,
        "has_magenta": False,
        "avg_dpi": 300,
        "errors": [],
        "warnings": []
    }


def check_folder(folder_path):
    """Run preflight checks on a folder."""
    folder = Path(folder_path)

    # Read order data
    order_data_path = folder / "complete-order-data.json"
    if not order_data_path.exists():
        return {
            "success": False,
            "overall_status": "FAIL",
            "order_id": "unknown",
            "customer_name": "unknown",
            "customer_email": None,
            "results": [],
            "error_message": "complete-order-data.json not found"
        }

    try:
        with open(order_data_path, 'r') as f:
            order_data = json.load(f)
    except Exception as e:
        return {
            "success": False,
            "overall_status": "FAIL",
            "order_id": "unknown",
            "customer_name": "unknown",
            "customer_email": None,
            "results": [],
            "error_message": f"Failed to read order data: {str(e)}"
        }

    # Extract customer info
    customer = order_data.get("customer", {})
    customer_name = customer.get("name", "Unknown")
    customer_email = customer.get("email")
    order_id = order_data.get("id", "unknown")

    # Find PDFs in folder
    pdf_files = list(folder.glob("*.pdf"))

    if not pdf_files:
        return {
            "success": False,
            "overall_status": "FAIL",
            "order_id": order_id,
            "customer_name": customer_name,
            "customer_email": customer_email,
            "results": [],
            "error_message": "No PDF files found in folder"
        }

    # Analyze each PDF
    results = []
    for pdf_path in pdf_files:
        result = analyze_pdf(pdf_path)
        results.append(result)

    # Determine overall status
    has_errors = any(r.get("errors") for r in results)
    has_warnings = any(r.get("warnings") for r in results)

    if has_errors:
        overall_status = "FAIL"
    elif has_warnings:
        overall_status = "WARNING"
    else:
        overall_status = "PASS"

    return {
        "success": True,
        "overall_status": overall_status,
        "order_id": order_id,
        "customer_name": customer_name,
        "customer_email": customer_email,
        "results": results
    }


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 quick-preflight.py /path/to/folder", file=sys.stderr)
        sys.exit(1)

    folder_path = sys.argv[1]

    if not os.path.isdir(folder_path):
        print(json.dumps({
            "success": False,
            "overall_status": "FAIL",
            "order_id": "unknown",
            "customer_name": "unknown",
            "customer_email": None,
            "results": [],
            "error_message": f"Folder not found: {folder_path}"
        }))
        sys.exit(1)

    result = check_folder(folder_path)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
