import ReactGA from 'react-ga4';

// Initialize GA4 with your measurement ID
export const initGA = () => {
  ReactGA.initialize('G-CHB4GBQ6CB');
};

// Track page views
export const trackPageView = (path: string) => {
  ReactGA.send({
    hitType: 'pageview',
    page: path
  });
};

// Track custom events
export const trackEvent = (category: string, action: string, label?: string) => {
  ReactGA.event({
    category,
    action,
    label,
  });
}; 