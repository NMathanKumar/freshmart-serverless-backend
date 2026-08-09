// src/metrics/index.js
// Shared EMF metrics helper for FreshMart services
// Emits CloudWatch Embedded Metric Format JSON via console.log

/**
 * Emit a single business metric using EMF.
 * @param {string} name - Metric name (e.g., "OrderPlaced")
 * @param {number} value - Metric value
 * @param {string} unit - CloudWatch unit (e.g., "Count", "Milliseconds", "None")
 * @param {object} extraDimensions - Additional dimensions (optional)
 */
function emitBusinessMetric(name, value, unit = "Count", extraDimensions = {}) {
  // Strip high-cardinality dimensions to prevent AWS CloudWatch billing alerts
  const { Category, userId, orderId, requestId, email, url, ...safeDimensions } = extraDimensions;
  
  const dimensions = {
    Service: process.env.SERVICE_NAME || "unknown",
    Environment: process.env.NODE_ENV || "development",
    EventType: safeDimensions.EventType || "general",
    ...safeDimensions,
    MetricVersion: "1"
  };

  const metric = {
    _aws: {
      Timestamp: Date.now(),
      CloudWatchMetrics: [
        {
          Namespace: "FreshMart/Business",
          Dimensions: [Object.keys(dimensions)],
          Metrics: [{ Name: name, Unit: unit }]
        }
      ]
    },
    ...dimensions,
    [name]: value
  };

  console.log(JSON.stringify(metric));
}

/**
 * Emit multiple metrics in a single EMF log line.
 * @param {Array<{name:string,value:number,unit?:string,extraDimensions?:object}>} metricsArray
 */
function emitBusinessMetrics(metricsArray) {
  if (!Array.isArray(metricsArray) || metricsArray.length === 0) return;
  const baseDimensions = {
    Service: process.env.SERVICE_NAME || "unknown",
    Environment: process.env.NODE_ENV || "development",
    MetricVersion: "1"
  };
  const entries = metricsArray.map(m => {
    // Strip high-cardinality dimensions to prevent AWS CloudWatch billing alerts
    const { Category, userId, orderId, requestId, email, url, ...safeDimensions } = m.extraDimensions || {};
    const dims = {
      EventType: safeDimensions.EventType || "general",
      ...safeDimensions
    };
    return {
      name: m.name,
      value: m.value,
      unit: m.unit || "Count",
      dimensions: { ...baseDimensions, ...dims }
    };
  });

  const allDimensionKeys = Array.from(
    new Set(entries.flatMap(e => Object.keys(e.dimensions)))
  );

  const metricPayload = {
    _aws: {
      Timestamp: Date.now(),
      CloudWatchMetrics: [
        {
          Namespace: "FreshMart/Business",
          Dimensions: [allDimensionKeys],
          Metrics: entries.map(e => ({ Name: e.name, Unit: e.unit }))
        }
      ]
    },
    ...Object.assign(
      {},
      ...entries.map(e => e.dimensions)
    ),
    ...Object.fromEntries(entries.map(e => [e.name, e.value]))
  };

  console.log(JSON.stringify(metricPayload));
}

module.exports = { emitBusinessMetric, emitBusinessMetrics };
