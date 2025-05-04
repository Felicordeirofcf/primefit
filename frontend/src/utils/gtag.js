export const GA_MEASUREMENT_ID = "G-JZSPT4951W";

export const event = ({ action, category, label, value }) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};
