import { HydratedRouter } from 'react-router/dom';
import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';

hydrateRoot(
  document,
  <StrictMode>
    <HydratedRouter />
  </StrictMode>,
);
