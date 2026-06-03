import ReactGA from "react-ga4";

export const initAnalytics = () => {
  ReactGA.initialize("G-5NEELFBVX0");
};

export const trackEvent = (eventName, params = {}) => {
  ReactGA.event(eventName, params);
};