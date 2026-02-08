// Accessibility Audit and Compliance Utilities

export interface AccessibilityIssue {
  id: string;
  element: HTMLElement | null;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  suggestion: string;
  wcagLevel: 'A' | 'AA' | 'AAA';
  wcagGuideline: string;
}

export interface AuditResult {
  issues: AccessibilityIssue[];
  score: number;
  totalElements: number;
  passedElements: number;
}

export class AccessibilityAuditor {
  /**
   * Performs a basic accessibility audit on the given container
   */
  static async audit(container: HTMLElement = document.body): Promise<AuditResult> {
    const issues: AccessibilityIssue[] = [];

    // Check for images without alt attributes
    const images = container.querySelectorAll('img');
    images.forEach(img => {
      if (!img.hasAttribute('alt')) {
        issues.push({
          id: `missing-alt-${Math.random().toString(36).substr(2, 9)}`,
          element: img,
          severity: 'critical',
          description: 'Image missing alt attribute',
          suggestion: 'Add descriptive alt text for screen readers',
          wcagLevel: 'A',
          wcagGuideline: '1.1.1 Non-text Content'
        });
      }
    });

    // Check for focusable elements without keyboard access
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    focusableElements.forEach(el => {
      // Check if element is visible but not keyboard accessible
      const computedStyle = window.getComputedStyle(el as HTMLElement);
      if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
        return;
      }

      if (!(el as HTMLElement).tabIndex || (el as HTMLElement).tabIndex < 0) {
        issues.push({
          id: `keyboard-access-${Math.random().toString(36).substr(2, 9)}`,
          element: el as HTMLElement,
          severity: 'serious',
          description: 'Interactive element not keyboard accessible',
          suggestion: 'Ensure element has a positive tabIndex or is naturally focusable',
          wcagLevel: 'A',
          wcagGuideline: '2.1.1 Keyboard'
        });
      }
    });

    // Check for sufficient color contrast
    const textElements = container.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, li, td, th');
    textElements.forEach(el => {
      const computedStyle = window.getComputedStyle(el as HTMLElement);
      const bgColor = this.getBackgroundColor(el as HTMLElement);
      const textColor = computedStyle.color;

      if (!this.hasSufficientContrast(textColor, bgColor)) {
        issues.push({
          id: `color-contrast-${Math.random().toString(36).substr(2, 9)}`,
          element: el as HTMLElement,
          severity: 'serious',
          description: 'Insufficient color contrast',
          suggestion: 'Increase contrast ratio to meet WCAG AA standards (4.5:1 for normal text)',
          wcagLevel: 'AA',
          wcagGuideline: '1.4.3 Contrast (Minimum)'
        });
      }
    });

    // Check for form labels
    const inputs = container.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      const id = (input as HTMLInputElement).id;
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`);
        if (!label) {
          issues.push({
            id: `missing-label-${Math.random().toString(36).substr(2, 9)}`,
            element: input as HTMLElement,
            severity: 'moderate',
            description: 'Form input missing associated label',
            suggestion: 'Add a label element associated with the input using the "for" attribute',
            wcagLevel: 'A',
            wcagGuideline: '1.3.1 Info and Relationships'
          });
        }
      }
    });

    // Calculate score
    const totalElements = focusableElements.length + textElements.length + images.length;
    const passedElements = totalElements - issues.length;
    const score = totalElements > 0 ? Math.round((passedElements / totalElements) * 100) : 100;

    return {
      issues,
      score,
      totalElements,
      passedElements
    };
  }

  /**
   * Gets the background color of an element accounting for transparency
   */
  private static getBackgroundColor(element: HTMLElement): string {
    let bgColor = window.getComputedStyle(element).backgroundColor;

    // If background is transparent, traverse up the DOM tree
    if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
      let parent = element.parentElement;
      while (parent && (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent')) {
        bgColor = window.getComputedStyle(parent).backgroundColor;
        parent = parent.parentElement;
      }
    }

    return bgColor;
  }

  /**
   * Checks if two colors have sufficient contrast
   */
  private static hasSufficientContrast(color1: string, color2: string): boolean {
    const contrastRatio = this.calculateContrastRatio(color1, color2);
    // WCAG AA standard requires 4.5:1 for normal text, 3:1 for large text
    return contrastRatio >= 4.5;
  }

  /**
   * Calculates contrast ratio between two colors
   */
  private static calculateContrastRatio(color1: string, color2: string): number {
    const rgb1 = this.parseColor(color1);
    const rgb2 = this.parseColor(color2);

    const lum1 = this.relativeLuminance(rgb1);
    const lum2 = this.relativeLuminance(rgb2);

    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
  }

  /**
   * Parses a color string to RGB values
   */
  private static parseColor(color: string): [number, number, number] {
    if (color.startsWith('rgb')) {
      const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (match) {
        return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
      }
    } else if (color.startsWith('#')) {
      const hex = color.substring(1);
      const bigint = parseInt(hex, 16);
      return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
    }

    // Default to black if parsing fails
    return [0, 0, 0];
  }

  /**
   * Calculates relative luminance of a color
   */
  private static relativeLuminance([r, g, b]: [number, number, number]): number {
    const RsRGB = r / 255;
    const GsRGB = g / 255;
    const BsRGB = b / 255;

    const R = RsRGB <= 0.03928 ? RsRGB / 12.92 : Math.pow((RsRGB + 0.055) / 1.055, 2.4);
    const G = GsRGB <= 0.03928 ? GsRGB / 12.92 : Math.pow((GsRGB + 0.055) / 1.055, 2.4);
    const B = BsRGB <= 0.03928 ? BsRGB / 12.92 : Math.pow((BsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  }

  /**
   * Generates an accessibility report
   */
  static generateReport(result: AuditResult): string {
    const reportLines = [
      'Accessibility Audit Report',
      '========================',
      `Score: ${result.score}/100 (${result.passedElements}/${result.totalElements} elements passed)`,
      '',
      'Issues Found:',
      '-------------'
    ];

    result.issues.forEach(issue => {
      reportLines.push(`${issue.severity.toUpperCase()}: ${issue.description}`);
      reportLines.push(`WCAG ${issue.wcagLevel} - Guideline ${issue.wcagGuideline}`);
      reportLines.push(`Suggestion: ${issue.suggestion}`);
      reportLines.push('');
    });

    if (result.issues.length === 0) {
      reportLines.push('No accessibility issues found!');
    }

    return reportLines.join('\n');
  }
}

// Utility functions for common accessibility fixes
export const AccessibilityFixes = {
  /**
   * Adds focus indicators to elements that need them
   */
  addFocusIndicators(selector: string = 'button, a, input, select, textarea, [tabindex]') {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      (el as HTMLElement).addEventListener('focus', () => {
        (el as HTMLElement).classList.add('focus-visible');
      });
      (el as HTMLElement).addEventListener('blur', () => {
        (el as HTMLElement).classList.remove('focus-visible');
      });
    });
  },

  /**
   * Ensures all images have appropriate alt text
   */
  ensureImageAltText() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.hasAttribute('alt')) {
        // If image is decorative, set alt to empty string
        // Otherwise, provide a meaningful description
        img.setAttribute('alt', '');
      }
    });
  },

  /**
   * Improves semantic structure
   */
  improveSemantics() {
    // Add landmark roles if not present
    const main = document.querySelector('main');
    if (main && !main.getAttribute('role')) {
      main.setAttribute('role', 'main');
    }

    const header = document.querySelector('header');
    if (header && !header.getAttribute('role')) {
      header.setAttribute('role', 'banner');
    }

    const nav = document.querySelector('nav');
    if (nav && !nav.getAttribute('role')) {
      nav.setAttribute('role', 'navigation');
    }
  }
};