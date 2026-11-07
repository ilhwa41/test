const PATHS = {
  logo: <path strokeLinejoin="round" d="M12 3 4 7v10l8 4 8-4V7l-8-4Zm-8 4 8 4 8-4m-8 4v10" />,
  home: <path strokeLinejoin="round" d="m4 11 8-7 8 7v9h-5v-6H9v6H4v-9Z" />,
  pen: <path strokeLinejoin="round" d="m4 20 1-5L16 4l4 4L9 19l-5 1Zm9-13 4 4" />,
  check: <path strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="m5 12.5 4.5 4.5L19 7.5" />,
  alert: <path strokeWidth="3" strokeLinecap="round" d="M12 5v9m0 5v.01" />,
  plus: <path strokeWidth="2.4" strokeLinecap="round" d="M12 5v14M5 12h14" />,
  scale: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16M6 20h12M5 8h14M5 8l-2.5 6h5L5 8Zm14 0-2.5 6h5L19 8Z" />,
  box: <path strokeLinejoin="round" d="M12 3 4 7v10l8 4 8-4V7l-8-4Zm-8 4 8 4 8-4m-8 4v10" />,
  yarn: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path strokeLinecap="round" d="M5 8c5 0 10 3 13 9M8 4.5c4 2 8 6 10.5 11M4 13c3 0 7 2 9 7" />
    </>
  ),
  tag: <path strokeLinejoin="round" d="M4 4h8l8 8-8 8-8-8V4Zm4.5 4.5v.01" />,
  roll: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
};

export type IconName = keyof typeof PATHS;

export function Icon({ name }: { name: IconName }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}
