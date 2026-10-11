import React from "react";

export interface SocialIconProps {
  platform: string;
  className?: string;
  size?: number;
}

export function SocialIcon({ platform, className = "w-4 h-4", size = 16 }: SocialIconProps) {
  const norm = (platform || "").toLowerCase().trim();

  switch (norm) {
    case "facebook":
      return (
        <svg
          className={className}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      );

    case "instagram":
      return (
        <svg
          className={className}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      );

    case "twitter":
    case "x":
      return (
        <svg
          className={className}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );

    case "youtube":
      return (
        <svg
          className={className}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
          <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" />
        </svg>
      );

    case "vimeo":
      return (
        <svg
          className={className}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.6 8.761 3.864 7.441 3.109 7.441c-.167 0-.749.354-1.748 1.058L0 6.786c1.151-1.008 2.378-2.023 3.682-3.044 1.777-1.464 3.107-2.235 3.99-2.316 1.95-.181 3.155 1.156 3.614 4.01.59 3.687 1.002 6.002 1.236 6.942.705 3.197 1.492 4.795 2.36 4.795.666 0 1.637-.999 2.911-2.998 1.275-1.999 1.956-3.535 2.045-4.606.155-1.764-.477-2.646-1.896-2.646-.667 0-1.365.15-2.096.447 1.371-4.475 3.992-6.634 7.863-6.475 2.87.121 4.226 1.83 4.068 5.12z" />
        </svg>
      );

    case "px500":
    case "500px":
      return (
        <svg
          className={className}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M5.4 17.5c-2.3 0-4.2-1.8-4.2-4.1 0-2.3 1.9-4.1 4.2-4.1 1.6 0 2.9.8 3.6 2.1l-1.8.8c-.4-.7-1.1-1.1-1.8-1.1-1.3 0-2.3 1-2.3 2.3s1 2.3 2.3 2.3c.7 0 1.4-.4 1.8-1.1l1.8.8c-.7 1.3-2 2.1-3.6 2.1zm7.1 0c-2.4 0-4.3-1.9-4.3-4.2 0-2.3 1.9-4.2 4.3-4.2s4.3 1.9 4.3 4.2c0 2.3-1.9 4.2-4.3 4.2zm0-6.6c-1.3 0-2.4 1.1-2.4 2.4 0 1.3 1.1 2.4 2.4 2.4s2.4-1.1 2.4-2.4c0-1.3-1.1-2.4-2.4-2.4zm8.6 6.6c-2.4 0-4.3-1.9-4.3-4.2 0-2.3 1.9-4.2 4.3-4.2 2.4 0 4.3 1.9 4.3 4.2 0 2.3-1.9 4.2-4.3 4.2zm0-6.6c-1.3 0-2.4 1.1-2.4 2.4 0 1.3 1.1 2.4 2.4 2.4 1.3 0 2.4-1.1 2.4-2.4 0-1.3-1.1-2.4-2.4-2.4z" />
        </svg>
      );

    case "flickr":
      return (
        <svg
          className={className}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <circle cx="7" cy="12" r="5" fill="#0063dc" />
          <circle cx="17" cy="12" r="5" fill="#ff0084" />
        </svg>
      );

    case "tiktok":
      return (
        <svg
          className={className}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.41a6.33 6.33 0 0 0-.85-.06A6.34 6.34 0 0 0 3.14 15.7a6.34 6.34 0 0 0 10.82 4.47V10.8a8.28 8.28 0 0 0 5.63 2.18V9.53a4.85 4.85 0 0 1-3.77-2.84z" />
        </svg>
      );

    case "linkedin":
      return (
        <svg
          className={className}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect width="4" height="12" x="2" y="9" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      );

    case "pinterest":
      return (
        <svg
          className={className}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
        </svg>
      );

    case "threads":
      return (
        <svg
          className={className}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12.001 2c-5.523 0-10 4.477-10 10s4.477 10 10 10c4.372 0 8.117-2.809 9.475-6.732a.75.75 0 0 0-1.42-.49A8.502 8.502 0 0 1 12 20.5c-4.694 0-8.5-3.806-8.5-8.5s3.806-8.5 8.5-8.5c4.542 0 8.243 3.565 8.487 8.049.038.718-.016 1.436-.16 2.138-.43 2.1-2.146 3.513-4.227 3.513-2.193 0-3.95-1.638-3.95-3.97v-.4c0-1.874 1.36-3.23 3.18-3.23 1.34 0 2.298.745 2.613 1.834.098.341.455.53.796.423.342-.107.531-.464.423-.805-.443-1.528-1.848-2.552-3.832-2.552-2.57 0-4.68 1.956-4.68 4.73v.4c0 3.155 2.378 5.47 5.45 5.47 2.825 0 5.176-1.928 5.758-4.773.188-.918.257-1.858.207-2.793C21.787 6.136 17.39 2 12.001 2z" />
        </svg>
      );

    case "whatsapp":
      return (
        <svg
          className={className}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      );

    case "telegram":
      return (
        <svg
          className={className}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="22" x2="11" y1="2" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      );

    case "discord":
      return (
        <svg
          className={className}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      );

    case "reddit":
      return (
        <svg
          className={className}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M17 13c-.7 1-2.1 1.7-5 1.7s-4.3-.7-5-1.7" />
          <circle cx="9" cy="9.5" r="1" fill="currentColor" />
          <circle cx="15" cy="9.5" r="1" fill="currentColor" />
        </svg>
      );

    case "patreon":
      return (
        <svg
          className={className}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <circle cx="14.5" cy="9.5" r="6.5" />
          <rect x="3" y="3" width="4" height="18" rx="1" />
        </svg>
      );

    case "behance":
      return (
        <svg
          className={className}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M7.8 12.3c.7-.3 1.2-.9 1.2-1.8 0-1.8-1.3-2.5-3.3-2.5H0v10h6.1c2 0 3.6-.9 3.6-2.9 0-1.4-.8-2.3-1.9-2.8zM2.8 9.6h2.8c.8 0 1.4.3 1.4 1.1s-.6 1.1-1.4 1.1H2.8V9.6zm3.1 6.8H2.8v-2.5h3.1c.9 0 1.6.4 1.6 1.2 0 .9-.7 1.3-1.6 1.3zm12.3-6.4c-3.1 0-5.1 2.2-5.1 5s2 5 5.1 5c2.3 0 4-1.3 4.7-3.3h-2.3c-.4.9-1.2 1.4-2.4 1.4-1.5 0-2.4-1-2.5-2.4h7.3c.1-.2.1-.5.1-.7 0-2.9-1.8-5-4.9-5zm-2.5 4c.2-1.1.9-1.9 2.4-1.9 1.4 0 2.2.8 2.3 1.9h-4.7zM15.4 6h5.3v1.3h-5.3V6z" />
        </svg>
      );

    case "artstation":
      return (
        <svg
          className={className}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M0 17.723l2.027 3.504h.001a2.424 2.424 0 0 0 2.164 1.332h13.256l-3.674-6.357H0l.001 1.521zm24 .355L14.773 3.013A2.43 2.43 0 0 0 12.668 1.74a2.433 2.433 0 0 0-2.106 1.272L9.29 5.228l8.97 15.534h4.184A1.56 1.56 0 0 0 24 19.32a1.554 1.554 0 0 0 0-1.242zM11.666 9.38l-4.22 7.307h8.441l-4.221-7.307z" />
        </svg>
      );

    case "spotify":
      return (
        <svg
          className={className}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M8 11.5c3.5-1 7.5-.5 10.5 1.5" />
          <path d="M9 14.5c2.5-.7 5.5-.3 7.8 1.1" />
          <path d="M7 8.5c4.5-1.2 9.5-.7 13.5 1.8" />
        </svg>
      );

    case "github":
      return (
        <svg
          className={className}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
          <path d="M9 18c-4.51 2-5-2-7-2" />
        </svg>
      );

    case "website":
    case "globe":
      return (
        <svg
          className={className}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="2" x2="22" y1="12" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );

    case "email":
    case "mail":
      return (
        <svg
          className={className}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      );

    default:
      return (
        <svg
          className={className}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      );
  }
}
