# Performance Testing Guide

## Overview
Performance tests for HopOn ride-sharing platform using k6.

## Prerequisites
- k6 installed: `choco install k6` (Windows) or `brew install k6` (Mac)
- API Gateway running on http://localhost:3000

## Test Types

### 1. Load Test (load-test.js)
Tests normal and peak load conditions.
```bash
k6 run test/performance/load-test.js
```

**Stages:**
- 50 users for 5 minutes
- 100 users for 5 minutes

**Thresholds:**
- 95% of requests < 500ms
- Error rate < 10%

### 2. Stress Test (stress-test.js)
Pushes system beyond normal capacity.
```bash
k6 run test/performance/stress-test.js
```

**Stages:**
- Ramp to 1000 concurrent users
- Identify breaking point

**Thresholds:**
- 95% of requests < 1000ms
- Error rate < 20%

### 3. Spike Test (spike-test.js)
Tests sudden traffic surge.
```bash
k6 run test/performance/spike-test.js
```

**Scenario:**
- Normal: 50 users
- Spike: 1000 users (sudden)
- Duration: 10 seconds

### 4. Soak Test (soak-test.js)
Tests sustained load over time (memory leaks, degradation).
```bash
k6 run test/performance/soak-test.js
```

**Duration:** 30 minutes at 100 users

## Running Tests

### Single Test
```bash
k6 run test/performance/load-test.js
```

### With Options
```bash
k6 run --vus 100 --duration 30s test/performance/load-test.js
```

### Output to File
```bash
k6 run --out json=results.json test/performance/load-test.js
```

### Cloud Test (k6 Cloud)
```bash
k6 cloud test/performance/load-test.js
```

## Interpreting Results

### Key Metrics
- `http_req_duration`: Response time
- `http_req_failed`: Failed requests rate
- `iterations`: Completed test iterations
- `vus`: Virtual users

### Success Criteria
- ✅ p95 response time < 500ms
- ✅ Error rate < 5%
- ✅ No memory leaks during soak test
- ✅ System recovers after spike

## CI/CD Integration

Add to GitHub Actions:
```yaml
- name: Run Performance Tests
  run: |
    k6 run --quiet test/performance/load-test.js
```

## Recommendations

1. **Run load tests** before each release
2. **Run stress tests** monthly to find limits
3. **Run soak tests** before major deployments
4. **Monitor** response times, error rates, resource usage

## Troubleshooting

### High Error Rate
- Check database connections
- Review API Gateway logs
- Verify rate limiting settings

### Slow Response Times
- Check database query performance
- Review API caching strategy
- Consider horizontal scaling

### Memory Leaks
- Run soak test for longer duration
- Monitor heap size over time
- Check for unclosed connections
