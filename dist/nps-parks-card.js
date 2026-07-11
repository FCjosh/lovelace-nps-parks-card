var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/d3-array/dist/d3-array.js
var require_d3_array = __commonJS({
  "node_modules/d3-array/dist/d3-array.js"(exports, module) {
    (function(global, factory) {
      typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.d3 = global.d3 || {}));
    })(exports, (function(exports2) {
      "use strict";
      function ascending2(a, b) {
        return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
      }
      function bisector(f) {
        let delta = f;
        let compare = f;
        if (f.length === 1) {
          delta = (d, x) => f(d) - x;
          compare = ascendingComparator(f);
        }
        function left(a, x, lo, hi) {
          if (lo == null) lo = 0;
          if (hi == null) hi = a.length;
          while (lo < hi) {
            const mid = lo + hi >>> 1;
            if (compare(a[mid], x) < 0) lo = mid + 1;
            else hi = mid;
          }
          return lo;
        }
        function right(a, x, lo, hi) {
          if (lo == null) lo = 0;
          if (hi == null) hi = a.length;
          while (lo < hi) {
            const mid = lo + hi >>> 1;
            if (compare(a[mid], x) > 0) hi = mid;
            else lo = mid + 1;
          }
          return lo;
        }
        function center(a, x, lo, hi) {
          if (lo == null) lo = 0;
          if (hi == null) hi = a.length;
          const i = left(a, x, lo, hi - 1);
          return i > lo && delta(a[i - 1], x) > -delta(a[i], x) ? i - 1 : i;
        }
        return { left, center, right };
      }
      function ascendingComparator(f) {
        return (d, x) => ascending2(f(d), x);
      }
      function number(x) {
        return x === null ? NaN : +x;
      }
      function* numbers(values, valueof) {
        if (valueof === void 0) {
          for (let value of values) {
            if (value != null && (value = +value) >= value) {
              yield value;
            }
          }
        } else {
          let index2 = -1;
          for (let value of values) {
            if ((value = valueof(value, ++index2, values)) != null && (value = +value) >= value) {
              yield value;
            }
          }
        }
      }
      const ascendingBisect = bisector(ascending2);
      const bisectRight = ascendingBisect.right;
      const bisectLeft = ascendingBisect.left;
      const bisectCenter = bisector(number).center;
      function count(values, valueof) {
        let count2 = 0;
        if (valueof === void 0) {
          for (let value of values) {
            if (value != null && (value = +value) >= value) {
              ++count2;
            }
          }
        } else {
          let index2 = -1;
          for (let value of values) {
            if ((value = valueof(value, ++index2, values)) != null && (value = +value) >= value) {
              ++count2;
            }
          }
        }
        return count2;
      }
      function length$1(array3) {
        return array3.length | 0;
      }
      function empty2(length2) {
        return !(length2 > 0);
      }
      function arrayify(values) {
        return typeof values !== "object" || "length" in values ? values : Array.from(values);
      }
      function reducer(reduce2) {
        return (values) => reduce2(...values);
      }
      function cross(...values) {
        const reduce2 = typeof values[values.length - 1] === "function" && reducer(values.pop());
        values = values.map(arrayify);
        const lengths = values.map(length$1);
        const j = values.length - 1;
        const index2 = new Array(j + 1).fill(0);
        const product = [];
        if (j < 0 || lengths.some(empty2)) return product;
        while (true) {
          product.push(index2.map((j2, i2) => values[i2][j2]));
          let i = j;
          while (++index2[i] === lengths[i]) {
            if (i === 0) return reduce2 ? product.map(reduce2) : product;
            index2[i--] = 0;
          }
        }
      }
      function cumsum(values, valueof) {
        var sum2 = 0, index2 = 0;
        return Float64Array.from(values, valueof === void 0 ? (v) => sum2 += +v || 0 : (v) => sum2 += +valueof(v, index2++, values) || 0);
      }
      function descending(a, b) {
        return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
      }
      function variance(values, valueof) {
        let count2 = 0;
        let delta;
        let mean2 = 0;
        let sum2 = 0;
        if (valueof === void 0) {
          for (let value of values) {
            if (value != null && (value = +value) >= value) {
              delta = value - mean2;
              mean2 += delta / ++count2;
              sum2 += delta * (value - mean2);
            }
          }
        } else {
          let index2 = -1;
          for (let value of values) {
            if ((value = valueof(value, ++index2, values)) != null && (value = +value) >= value) {
              delta = value - mean2;
              mean2 += delta / ++count2;
              sum2 += delta * (value - mean2);
            }
          }
        }
        if (count2 > 1) return sum2 / (count2 - 1);
      }
      function deviation(values, valueof) {
        const v = variance(values, valueof);
        return v ? Math.sqrt(v) : v;
      }
      function extent(values, valueof) {
        let min2;
        let max2;
        if (valueof === void 0) {
          for (const value of values) {
            if (value != null) {
              if (min2 === void 0) {
                if (value >= value) min2 = max2 = value;
              } else {
                if (min2 > value) min2 = value;
                if (max2 < value) max2 = value;
              }
            }
          }
        } else {
          let index2 = -1;
          for (let value of values) {
            if ((value = valueof(value, ++index2, values)) != null) {
              if (min2 === void 0) {
                if (value >= value) min2 = max2 = value;
              } else {
                if (min2 > value) min2 = value;
                if (max2 < value) max2 = value;
              }
            }
          }
        }
        return [min2, max2];
      }
      class Adder {
        constructor() {
          this._partials = new Float64Array(32);
          this._n = 0;
        }
        add(x) {
          const p = this._partials;
          let i = 0;
          for (let j = 0; j < this._n && j < 32; j++) {
            const y = p[j], hi = x + y, lo = Math.abs(x) < Math.abs(y) ? x - (hi - y) : y - (hi - x);
            if (lo) p[i++] = lo;
            x = hi;
          }
          p[i] = x;
          this._n = i + 1;
          return this;
        }
        valueOf() {
          const p = this._partials;
          let n = this._n, x, y, lo, hi = 0;
          if (n > 0) {
            hi = p[--n];
            while (n > 0) {
              x = hi;
              y = p[--n];
              hi = x + y;
              lo = y - (hi - x);
              if (lo) break;
            }
            if (n > 0 && (lo < 0 && p[n - 1] < 0 || lo > 0 && p[n - 1] > 0)) {
              y = lo * 2;
              x = hi + y;
              if (y == x - hi) hi = x;
            }
          }
          return hi;
        }
      }
      function fsum(values, valueof) {
        const adder = new Adder();
        if (valueof === void 0) {
          for (let value of values) {
            if (value = +value) {
              adder.add(value);
            }
          }
        } else {
          let index2 = -1;
          for (let value of values) {
            if (value = +valueof(value, ++index2, values)) {
              adder.add(value);
            }
          }
        }
        return +adder;
      }
      function fcumsum(values, valueof) {
        const adder = new Adder();
        let index2 = -1;
        return Float64Array.from(
          values,
          valueof === void 0 ? (v) => adder.add(+v || 0) : (v) => adder.add(+valueof(v, ++index2, values) || 0)
        );
      }
      class InternMap extends Map {
        constructor(entries, key = keyof) {
          super();
          Object.defineProperties(this, { _intern: { value: /* @__PURE__ */ new Map() }, _key: { value: key } });
          if (entries != null) for (const [key2, value] of entries) this.set(key2, value);
        }
        get(key) {
          return super.get(intern_get(this, key));
        }
        has(key) {
          return super.has(intern_get(this, key));
        }
        set(key, value) {
          return super.set(intern_set(this, key), value);
        }
        delete(key) {
          return super.delete(intern_delete(this, key));
        }
      }
      class InternSet extends Set {
        constructor(values, key = keyof) {
          super();
          Object.defineProperties(this, { _intern: { value: /* @__PURE__ */ new Map() }, _key: { value: key } });
          if (values != null) for (const value of values) this.add(value);
        }
        has(value) {
          return super.has(intern_get(this, value));
        }
        add(value) {
          return super.add(intern_set(this, value));
        }
        delete(value) {
          return super.delete(intern_delete(this, value));
        }
      }
      function intern_get({ _intern, _key }, value) {
        const key = _key(value);
        return _intern.has(key) ? _intern.get(key) : value;
      }
      function intern_set({ _intern, _key }, value) {
        const key = _key(value);
        if (_intern.has(key)) return _intern.get(key);
        _intern.set(key, value);
        return value;
      }
      function intern_delete({ _intern, _key }, value) {
        const key = _key(value);
        if (_intern.has(key)) {
          value = _intern.get(value);
          _intern.delete(key);
        }
        return value;
      }
      function keyof(value) {
        return value !== null && typeof value === "object" ? value.valueOf() : value;
      }
      function identity(x) {
        return x;
      }
      function group(values, ...keys) {
        return nest(values, identity, identity, keys);
      }
      function groups(values, ...keys) {
        return nest(values, Array.from, identity, keys);
      }
      function rollup(values, reduce2, ...keys) {
        return nest(values, identity, reduce2, keys);
      }
      function rollups(values, reduce2, ...keys) {
        return nest(values, Array.from, reduce2, keys);
      }
      function index(values, ...keys) {
        return nest(values, identity, unique, keys);
      }
      function indexes(values, ...keys) {
        return nest(values, Array.from, unique, keys);
      }
      function unique(values) {
        if (values.length !== 1) throw new Error("duplicate key");
        return values[0];
      }
      function nest(values, map2, reduce2, keys) {
        return (function regroup(values2, i) {
          if (i >= keys.length) return reduce2(values2);
          const groups2 = new InternMap();
          const keyof2 = keys[i++];
          let index2 = -1;
          for (const value of values2) {
            const key = keyof2(value, ++index2, values2);
            const group2 = groups2.get(key);
            if (group2) group2.push(value);
            else groups2.set(key, [value]);
          }
          for (const [key, values3] of groups2) {
            groups2.set(key, regroup(values3, i));
          }
          return map2(groups2);
        })(values, 0);
      }
      function permute(source, keys) {
        return Array.from(keys, (key) => source[key]);
      }
      function sort(values, ...F) {
        if (typeof values[Symbol.iterator] !== "function") throw new TypeError("values is not iterable");
        values = Array.from(values);
        let [f = ascending2] = F;
        if (f.length === 1 || F.length > 1) {
          const index2 = Uint32Array.from(values, (d, i) => i);
          if (F.length > 1) {
            F = F.map((f2) => values.map(f2));
            index2.sort((i, j) => {
              for (const f2 of F) {
                const c = ascending2(f2[i], f2[j]);
                if (c) return c;
              }
            });
          } else {
            f = values.map(f);
            index2.sort((i, j) => ascending2(f[i], f[j]));
          }
          return permute(values, index2);
        }
        return values.sort(f);
      }
      function groupSort(values, reduce2, key) {
        return (reduce2.length === 1 ? sort(rollup(values, reduce2, key), (([ak, av], [bk, bv]) => ascending2(av, bv) || ascending2(ak, bk))) : sort(group(values, key), (([ak, av], [bk, bv]) => reduce2(av, bv) || ascending2(ak, bk)))).map(([key2]) => key2);
      }
      var array2 = Array.prototype;
      var slice = array2.slice;
      function constant(x) {
        return function() {
          return x;
        };
      }
      var e10 = Math.sqrt(50), e5 = Math.sqrt(10), e2 = Math.sqrt(2);
      function ticks(start, stop, count2) {
        var reverse2, i = -1, n, ticks2, step;
        stop = +stop, start = +start, count2 = +count2;
        if (start === stop && count2 > 0) return [start];
        if (reverse2 = stop < start) n = start, start = stop, stop = n;
        if ((step = tickIncrement(start, stop, count2)) === 0 || !isFinite(step)) return [];
        if (step > 0) {
          let r0 = Math.round(start / step), r1 = Math.round(stop / step);
          if (r0 * step < start) ++r0;
          if (r1 * step > stop) --r1;
          ticks2 = new Array(n = r1 - r0 + 1);
          while (++i < n) ticks2[i] = (r0 + i) * step;
        } else {
          step = -step;
          let r0 = Math.round(start * step), r1 = Math.round(stop * step);
          if (r0 / step < start) ++r0;
          if (r1 / step > stop) --r1;
          ticks2 = new Array(n = r1 - r0 + 1);
          while (++i < n) ticks2[i] = (r0 + i) / step;
        }
        if (reverse2) ticks2.reverse();
        return ticks2;
      }
      function tickIncrement(start, stop, count2) {
        var step = (stop - start) / Math.max(0, count2), power = Math.floor(Math.log(step) / Math.LN10), error = step / Math.pow(10, power);
        return power >= 0 ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power) : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
      }
      function tickStep(start, stop, count2) {
        var step0 = Math.abs(stop - start) / Math.max(0, count2), step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)), error = step0 / step1;
        if (error >= e10) step1 *= 10;
        else if (error >= e5) step1 *= 5;
        else if (error >= e2) step1 *= 2;
        return stop < start ? -step1 : step1;
      }
      function nice(start, stop, count2) {
        let prestep;
        while (true) {
          const step = tickIncrement(start, stop, count2);
          if (step === prestep || step === 0 || !isFinite(step)) {
            return [start, stop];
          } else if (step > 0) {
            start = Math.floor(start / step) * step;
            stop = Math.ceil(stop / step) * step;
          } else if (step < 0) {
            start = Math.ceil(start * step) / step;
            stop = Math.floor(stop * step) / step;
          }
          prestep = step;
        }
      }
      function sturges(values) {
        return Math.ceil(Math.log(count(values)) / Math.LN2) + 1;
      }
      function bin() {
        var value = identity, domain = extent, threshold = sturges;
        function histogram(data) {
          if (!Array.isArray(data)) data = Array.from(data);
          var i, n = data.length, x, values = new Array(n);
          for (i = 0; i < n; ++i) {
            values[i] = value(data[i], i, data);
          }
          var xz = domain(values), x0 = xz[0], x1 = xz[1], tz = threshold(values, x0, x1);
          if (!Array.isArray(tz)) {
            const max2 = x1, tn = +tz;
            if (domain === extent) [x0, x1] = nice(x0, x1, tn);
            tz = ticks(x0, x1, tn);
            if (tz[tz.length - 1] >= x1) {
              if (max2 >= x1 && domain === extent) {
                const step = tickIncrement(x0, x1, tn);
                if (isFinite(step)) {
                  if (step > 0) {
                    x1 = (Math.floor(x1 / step) + 1) * step;
                  } else if (step < 0) {
                    x1 = (Math.ceil(x1 * -step) + 1) / -step;
                  }
                }
              } else {
                tz.pop();
              }
            }
          }
          var m = tz.length;
          while (tz[0] <= x0) tz.shift(), --m;
          while (tz[m - 1] > x1) tz.pop(), --m;
          var bins = new Array(m + 1), bin2;
          for (i = 0; i <= m; ++i) {
            bin2 = bins[i] = [];
            bin2.x0 = i > 0 ? tz[i - 1] : x0;
            bin2.x1 = i < m ? tz[i] : x1;
          }
          for (i = 0; i < n; ++i) {
            x = values[i];
            if (x0 <= x && x <= x1) {
              bins[bisectRight(tz, x, 0, m)].push(data[i]);
            }
          }
          return bins;
        }
        histogram.value = function(_) {
          return arguments.length ? (value = typeof _ === "function" ? _ : constant(_), histogram) : value;
        };
        histogram.domain = function(_) {
          return arguments.length ? (domain = typeof _ === "function" ? _ : constant([_[0], _[1]]), histogram) : domain;
        };
        histogram.thresholds = function(_) {
          return arguments.length ? (threshold = typeof _ === "function" ? _ : Array.isArray(_) ? constant(slice.call(_)) : constant(_), histogram) : threshold;
        };
        return histogram;
      }
      function max(values, valueof) {
        let max2;
        if (valueof === void 0) {
          for (const value of values) {
            if (value != null && (max2 < value || max2 === void 0 && value >= value)) {
              max2 = value;
            }
          }
        } else {
          let index2 = -1;
          for (let value of values) {
            if ((value = valueof(value, ++index2, values)) != null && (max2 < value || max2 === void 0 && value >= value)) {
              max2 = value;
            }
          }
        }
        return max2;
      }
      function min(values, valueof) {
        let min2;
        if (valueof === void 0) {
          for (const value of values) {
            if (value != null && (min2 > value || min2 === void 0 && value >= value)) {
              min2 = value;
            }
          }
        } else {
          let index2 = -1;
          for (let value of values) {
            if ((value = valueof(value, ++index2, values)) != null && (min2 > value || min2 === void 0 && value >= value)) {
              min2 = value;
            }
          }
        }
        return min2;
      }
      function quickselect(array3, k, left = 0, right = array3.length - 1, compare = ascending2) {
        while (right > left) {
          if (right - left > 600) {
            const n = right - left + 1;
            const m = k - left + 1;
            const z = Math.log(n);
            const s = 0.5 * Math.exp(2 * z / 3);
            const sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
            const newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
            const newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
            quickselect(array3, k, newLeft, newRight, compare);
          }
          const t = array3[k];
          let i = left;
          let j = right;
          swap(array3, left, k);
          if (compare(array3[right], t) > 0) swap(array3, left, right);
          while (i < j) {
            swap(array3, i, j), ++i, --j;
            while (compare(array3[i], t) < 0) ++i;
            while (compare(array3[j], t) > 0) --j;
          }
          if (compare(array3[left], t) === 0) swap(array3, left, j);
          else ++j, swap(array3, j, right);
          if (j <= k) left = j + 1;
          if (k <= j) right = j - 1;
        }
        return array3;
      }
      function swap(array3, i, j) {
        const t = array3[i];
        array3[i] = array3[j];
        array3[j] = t;
      }
      function quantile(values, p, valueof) {
        values = Float64Array.from(numbers(values, valueof));
        if (!(n = values.length)) return;
        if ((p = +p) <= 0 || n < 2) return min(values);
        if (p >= 1) return max(values);
        var n, i = (n - 1) * p, i0 = Math.floor(i), value0 = max(quickselect(values, i0).subarray(0, i0 + 1)), value1 = min(values.subarray(i0 + 1));
        return value0 + (value1 - value0) * (i - i0);
      }
      function quantileSorted(values, p, valueof = number) {
        if (!(n = values.length)) return;
        if ((p = +p) <= 0 || n < 2) return +valueof(values[0], 0, values);
        if (p >= 1) return +valueof(values[n - 1], n - 1, values);
        var n, i = (n - 1) * p, i0 = Math.floor(i), value0 = +valueof(values[i0], i0, values), value1 = +valueof(values[i0 + 1], i0 + 1, values);
        return value0 + (value1 - value0) * (i - i0);
      }
      function freedmanDiaconis(values, min2, max2) {
        return Math.ceil((max2 - min2) / (2 * (quantile(values, 0.75) - quantile(values, 0.25)) * Math.pow(count(values), -1 / 3)));
      }
      function scott(values, min2, max2) {
        return Math.ceil((max2 - min2) / (3.5 * deviation(values) * Math.pow(count(values), -1 / 3)));
      }
      function maxIndex(values, valueof) {
        let max2;
        let maxIndex2 = -1;
        let index2 = -1;
        if (valueof === void 0) {
          for (const value of values) {
            ++index2;
            if (value != null && (max2 < value || max2 === void 0 && value >= value)) {
              max2 = value, maxIndex2 = index2;
            }
          }
        } else {
          for (let value of values) {
            if ((value = valueof(value, ++index2, values)) != null && (max2 < value || max2 === void 0 && value >= value)) {
              max2 = value, maxIndex2 = index2;
            }
          }
        }
        return maxIndex2;
      }
      function mean(values, valueof) {
        let count2 = 0;
        let sum2 = 0;
        if (valueof === void 0) {
          for (let value of values) {
            if (value != null && (value = +value) >= value) {
              ++count2, sum2 += value;
            }
          }
        } else {
          let index2 = -1;
          for (let value of values) {
            if ((value = valueof(value, ++index2, values)) != null && (value = +value) >= value) {
              ++count2, sum2 += value;
            }
          }
        }
        if (count2) return sum2 / count2;
      }
      function median(values, valueof) {
        return quantile(values, 0.5, valueof);
      }
      function* flatten(arrays) {
        for (const array3 of arrays) {
          yield* array3;
        }
      }
      function merge(arrays) {
        return Array.from(flatten(arrays));
      }
      function minIndex(values, valueof) {
        let min2;
        let minIndex2 = -1;
        let index2 = -1;
        if (valueof === void 0) {
          for (const value of values) {
            ++index2;
            if (value != null && (min2 > value || min2 === void 0 && value >= value)) {
              min2 = value, minIndex2 = index2;
            }
          }
        } else {
          for (let value of values) {
            if ((value = valueof(value, ++index2, values)) != null && (min2 > value || min2 === void 0 && value >= value)) {
              min2 = value, minIndex2 = index2;
            }
          }
        }
        return minIndex2;
      }
      function pairs(values, pairof = pair) {
        const pairs2 = [];
        let previous;
        let first = false;
        for (const value of values) {
          if (first) pairs2.push(pairof(previous, value));
          previous = value;
          first = true;
        }
        return pairs2;
      }
      function pair(a, b) {
        return [a, b];
      }
      function range(start, stop, step) {
        start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;
        var i = -1, n = Math.max(0, Math.ceil((stop - start) / step)) | 0, range2 = new Array(n);
        while (++i < n) {
          range2[i] = start + i * step;
        }
        return range2;
      }
      function least(values, compare = ascending2) {
        let min2;
        let defined = false;
        if (compare.length === 1) {
          let minValue;
          for (const element of values) {
            const value = compare(element);
            if (defined ? ascending2(value, minValue) < 0 : ascending2(value, value) === 0) {
              min2 = element;
              minValue = value;
              defined = true;
            }
          }
        } else {
          for (const value of values) {
            if (defined ? compare(value, min2) < 0 : compare(value, value) === 0) {
              min2 = value;
              defined = true;
            }
          }
        }
        return min2;
      }
      function leastIndex(values, compare = ascending2) {
        if (compare.length === 1) return minIndex(values, compare);
        let minValue;
        let min2 = -1;
        let index2 = -1;
        for (const value of values) {
          ++index2;
          if (min2 < 0 ? compare(value, value) === 0 : compare(value, minValue) < 0) {
            minValue = value;
            min2 = index2;
          }
        }
        return min2;
      }
      function greatest(values, compare = ascending2) {
        let max2;
        let defined = false;
        if (compare.length === 1) {
          let maxValue;
          for (const element of values) {
            const value = compare(element);
            if (defined ? ascending2(value, maxValue) > 0 : ascending2(value, value) === 0) {
              max2 = element;
              maxValue = value;
              defined = true;
            }
          }
        } else {
          for (const value of values) {
            if (defined ? compare(value, max2) > 0 : compare(value, value) === 0) {
              max2 = value;
              defined = true;
            }
          }
        }
        return max2;
      }
      function greatestIndex(values, compare = ascending2) {
        if (compare.length === 1) return maxIndex(values, compare);
        let maxValue;
        let max2 = -1;
        let index2 = -1;
        for (const value of values) {
          ++index2;
          if (max2 < 0 ? compare(value, value) === 0 : compare(value, maxValue) > 0) {
            maxValue = value;
            max2 = index2;
          }
        }
        return max2;
      }
      function scan(values, compare) {
        const index2 = leastIndex(values, compare);
        return index2 < 0 ? void 0 : index2;
      }
      var shuffle = shuffler(Math.random);
      function shuffler(random) {
        return function shuffle2(array3, i0 = 0, i1 = array3.length) {
          let m = i1 - (i0 = +i0);
          while (m) {
            const i = random() * m-- | 0, t = array3[m + i0];
            array3[m + i0] = array3[i + i0];
            array3[i + i0] = t;
          }
          return array3;
        };
      }
      function sum(values, valueof) {
        let sum2 = 0;
        if (valueof === void 0) {
          for (let value of values) {
            if (value = +value) {
              sum2 += value;
            }
          }
        } else {
          let index2 = -1;
          for (let value of values) {
            if (value = +valueof(value, ++index2, values)) {
              sum2 += value;
            }
          }
        }
        return sum2;
      }
      function transpose(matrix) {
        if (!(n = matrix.length)) return [];
        for (var i = -1, m = min(matrix, length), transpose2 = new Array(m); ++i < m; ) {
          for (var j = -1, n, row = transpose2[i] = new Array(n); ++j < n; ) {
            row[j] = matrix[j][i];
          }
        }
        return transpose2;
      }
      function length(d) {
        return d.length;
      }
      function zip() {
        return transpose(arguments);
      }
      function every(values, test) {
        if (typeof test !== "function") throw new TypeError("test is not a function");
        let index2 = -1;
        for (const value of values) {
          if (!test(value, ++index2, values)) {
            return false;
          }
        }
        return true;
      }
      function some(values, test) {
        if (typeof test !== "function") throw new TypeError("test is not a function");
        let index2 = -1;
        for (const value of values) {
          if (test(value, ++index2, values)) {
            return true;
          }
        }
        return false;
      }
      function filter2(values, test) {
        if (typeof test !== "function") throw new TypeError("test is not a function");
        const array3 = [];
        let index2 = -1;
        for (const value of values) {
          if (test(value, ++index2, values)) {
            array3.push(value);
          }
        }
        return array3;
      }
      function map(values, mapper) {
        if (typeof values[Symbol.iterator] !== "function") throw new TypeError("values is not iterable");
        if (typeof mapper !== "function") throw new TypeError("mapper is not a function");
        return Array.from(values, (value, index2) => mapper(value, index2, values));
      }
      function reduce(values, reducer2, value) {
        if (typeof reducer2 !== "function") throw new TypeError("reducer is not a function");
        const iterator = values[Symbol.iterator]();
        let done, next, index2 = -1;
        if (arguments.length < 3) {
          ({ done, value } = iterator.next());
          if (done) return;
          ++index2;
        }
        while ({ done, value: next } = iterator.next(), !done) {
          value = reducer2(value, next, ++index2, values);
        }
        return value;
      }
      function reverse(values) {
        if (typeof values[Symbol.iterator] !== "function") throw new TypeError("values is not iterable");
        return Array.from(values).reverse();
      }
      function difference(values, ...others) {
        values = new Set(values);
        for (const other of others) {
          for (const value of other) {
            values.delete(value);
          }
        }
        return values;
      }
      function disjoint(values, other) {
        const iterator = other[Symbol.iterator](), set2 = /* @__PURE__ */ new Set();
        for (const v of values) {
          if (set2.has(v)) return false;
          let value, done;
          while ({ value, done } = iterator.next()) {
            if (done) break;
            if (Object.is(v, value)) return false;
            set2.add(value);
          }
        }
        return true;
      }
      function set(values) {
        return values instanceof Set ? values : new Set(values);
      }
      function intersection(values, ...others) {
        values = new Set(values);
        others = others.map(set);
        out: for (const value of values) {
          for (const other of others) {
            if (!other.has(value)) {
              values.delete(value);
              continue out;
            }
          }
        }
        return values;
      }
      function superset(values, other) {
        const iterator = values[Symbol.iterator](), set2 = /* @__PURE__ */ new Set();
        for (const o of other) {
          if (set2.has(o)) continue;
          let value, done;
          while ({ value, done } = iterator.next()) {
            if (done) return false;
            set2.add(value);
            if (Object.is(o, value)) break;
          }
        }
        return true;
      }
      function subset(values, other) {
        return superset(other, values);
      }
      function union(...others) {
        const set2 = /* @__PURE__ */ new Set();
        for (const other of others) {
          for (const o of other) {
            set2.add(o);
          }
        }
        return set2;
      }
      exports2.Adder = Adder;
      exports2.InternMap = InternMap;
      exports2.InternSet = InternSet;
      exports2.ascending = ascending2;
      exports2.bin = bin;
      exports2.bisect = bisectRight;
      exports2.bisectCenter = bisectCenter;
      exports2.bisectLeft = bisectLeft;
      exports2.bisectRight = bisectRight;
      exports2.bisector = bisector;
      exports2.count = count;
      exports2.cross = cross;
      exports2.cumsum = cumsum;
      exports2.descending = descending;
      exports2.deviation = deviation;
      exports2.difference = difference;
      exports2.disjoint = disjoint;
      exports2.every = every;
      exports2.extent = extent;
      exports2.fcumsum = fcumsum;
      exports2.filter = filter2;
      exports2.fsum = fsum;
      exports2.greatest = greatest;
      exports2.greatestIndex = greatestIndex;
      exports2.group = group;
      exports2.groupSort = groupSort;
      exports2.groups = groups;
      exports2.histogram = bin;
      exports2.index = index;
      exports2.indexes = indexes;
      exports2.intersection = intersection;
      exports2.least = least;
      exports2.leastIndex = leastIndex;
      exports2.map = map;
      exports2.max = max;
      exports2.maxIndex = maxIndex;
      exports2.mean = mean;
      exports2.median = median;
      exports2.merge = merge;
      exports2.min = min;
      exports2.minIndex = minIndex;
      exports2.nice = nice;
      exports2.pairs = pairs;
      exports2.permute = permute;
      exports2.quantile = quantile;
      exports2.quantileSorted = quantileSorted;
      exports2.quickselect = quickselect;
      exports2.range = range;
      exports2.reduce = reduce;
      exports2.reverse = reverse;
      exports2.rollup = rollup;
      exports2.rollups = rollups;
      exports2.scan = scan;
      exports2.shuffle = shuffle;
      exports2.shuffler = shuffler;
      exports2.some = some;
      exports2.sort = sort;
      exports2.subset = subset;
      exports2.sum = sum;
      exports2.superset = superset;
      exports2.thresholdFreedmanDiaconis = freedmanDiaconis;
      exports2.thresholdScott = scott;
      exports2.thresholdSturges = sturges;
      exports2.tickIncrement = tickIncrement;
      exports2.tickStep = tickStep;
      exports2.ticks = ticks;
      exports2.transpose = transpose;
      exports2.union = union;
      exports2.variance = variance;
      exports2.zip = zip;
      Object.defineProperty(exports2, "__esModule", { value: true });
    }));
  }
});

// node_modules/d3-geo/dist/d3-geo.js
var require_d3_geo = __commonJS({
  "node_modules/d3-geo/dist/d3-geo.js"(exports, module) {
    (function(global, factory) {
      typeof exports === "object" && typeof module !== "undefined" ? factory(exports, require_d3_array()) : typeof define === "function" && define.amd ? define(["exports", "d3-array"], factory) : (global = global || self, factory(global.d3 = global.d3 || {}, global.d3));
    })(exports, function(exports2, d3Array) {
      "use strict";
      var epsilon = 1e-6;
      var epsilon2 = 1e-12;
      var pi = Math.PI;
      var halfPi = pi / 2;
      var quarterPi = pi / 4;
      var tau = pi * 2;
      var degrees = 180 / pi;
      var radians = pi / 180;
      var abs = Math.abs;
      var atan = Math.atan;
      var atan2 = Math.atan2;
      var cos = Math.cos;
      var ceil = Math.ceil;
      var exp = Math.exp;
      var hypot = Math.hypot;
      var log = Math.log;
      var pow = Math.pow;
      var sin = Math.sin;
      var sign = Math.sign || function(x) {
        return x > 0 ? 1 : x < 0 ? -1 : 0;
      };
      var sqrt = Math.sqrt;
      var tan = Math.tan;
      function acos(x) {
        return x > 1 ? 0 : x < -1 ? pi : Math.acos(x);
      }
      function asin(x) {
        return x > 1 ? halfPi : x < -1 ? -halfPi : Math.asin(x);
      }
      function haversin(x) {
        return (x = sin(x / 2)) * x;
      }
      function noop() {
      }
      function streamGeometry(geometry, stream) {
        if (geometry && streamGeometryType.hasOwnProperty(geometry.type)) {
          streamGeometryType[geometry.type](geometry, stream);
        }
      }
      var streamObjectType = {
        Feature: function(object3, stream) {
          streamGeometry(object3.geometry, stream);
        },
        FeatureCollection: function(object3, stream) {
          var features = object3.features, i = -1, n = features.length;
          while (++i < n) streamGeometry(features[i].geometry, stream);
        }
      };
      var streamGeometryType = {
        Sphere: function(object3, stream) {
          stream.sphere();
        },
        Point: function(object3, stream) {
          object3 = object3.coordinates;
          stream.point(object3[0], object3[1], object3[2]);
        },
        MultiPoint: function(object3, stream) {
          var coordinates2 = object3.coordinates, i = -1, n = coordinates2.length;
          while (++i < n) object3 = coordinates2[i], stream.point(object3[0], object3[1], object3[2]);
        },
        LineString: function(object3, stream) {
          streamLine(object3.coordinates, stream, 0);
        },
        MultiLineString: function(object3, stream) {
          var coordinates2 = object3.coordinates, i = -1, n = coordinates2.length;
          while (++i < n) streamLine(coordinates2[i], stream, 0);
        },
        Polygon: function(object3, stream) {
          streamPolygon(object3.coordinates, stream);
        },
        MultiPolygon: function(object3, stream) {
          var coordinates2 = object3.coordinates, i = -1, n = coordinates2.length;
          while (++i < n) streamPolygon(coordinates2[i], stream);
        },
        GeometryCollection: function(object3, stream) {
          var geometries = object3.geometries, i = -1, n = geometries.length;
          while (++i < n) streamGeometry(geometries[i], stream);
        }
      };
      function streamLine(coordinates2, stream, closed) {
        var i = -1, n = coordinates2.length - closed, coordinate;
        stream.lineStart();
        while (++i < n) coordinate = coordinates2[i], stream.point(coordinate[0], coordinate[1], coordinate[2]);
        stream.lineEnd();
      }
      function streamPolygon(coordinates2, stream) {
        var i = -1, n = coordinates2.length;
        stream.polygonStart();
        while (++i < n) streamLine(coordinates2[i], stream, 1);
        stream.polygonEnd();
      }
      function geoStream(object3, stream) {
        if (object3 && streamObjectType.hasOwnProperty(object3.type)) {
          streamObjectType[object3.type](object3, stream);
        } else {
          streamGeometry(object3, stream);
        }
      }
      var areaRingSum = new d3Array.Adder();
      var areaSum = new d3Array.Adder(), lambda00, phi00, lambda0, cosPhi0, sinPhi0;
      var areaStream = {
        point: noop,
        lineStart: noop,
        lineEnd: noop,
        polygonStart: function() {
          areaRingSum = new d3Array.Adder();
          areaStream.lineStart = areaRingStart;
          areaStream.lineEnd = areaRingEnd;
        },
        polygonEnd: function() {
          var areaRing = +areaRingSum;
          areaSum.add(areaRing < 0 ? tau + areaRing : areaRing);
          this.lineStart = this.lineEnd = this.point = noop;
        },
        sphere: function() {
          areaSum.add(tau);
        }
      };
      function areaRingStart() {
        areaStream.point = areaPointFirst;
      }
      function areaRingEnd() {
        areaPoint(lambda00, phi00);
      }
      function areaPointFirst(lambda, phi) {
        areaStream.point = areaPoint;
        lambda00 = lambda, phi00 = phi;
        lambda *= radians, phi *= radians;
        lambda0 = lambda, cosPhi0 = cos(phi = phi / 2 + quarterPi), sinPhi0 = sin(phi);
      }
      function areaPoint(lambda, phi) {
        lambda *= radians, phi *= radians;
        phi = phi / 2 + quarterPi;
        var dLambda = lambda - lambda0, sdLambda = dLambda >= 0 ? 1 : -1, adLambda = sdLambda * dLambda, cosPhi = cos(phi), sinPhi = sin(phi), k = sinPhi0 * sinPhi, u = cosPhi0 * cosPhi + k * cos(adLambda), v = k * sdLambda * sin(adLambda);
        areaRingSum.add(atan2(v, u));
        lambda0 = lambda, cosPhi0 = cosPhi, sinPhi0 = sinPhi;
      }
      function area(object3) {
        areaSum = new d3Array.Adder();
        geoStream(object3, areaStream);
        return areaSum * 2;
      }
      function spherical(cartesian2) {
        return [atan2(cartesian2[1], cartesian2[0]), asin(cartesian2[2])];
      }
      function cartesian(spherical2) {
        var lambda = spherical2[0], phi = spherical2[1], cosPhi = cos(phi);
        return [cosPhi * cos(lambda), cosPhi * sin(lambda), sin(phi)];
      }
      function cartesianDot(a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
      }
      function cartesianCross(a, b) {
        return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
      }
      function cartesianAddInPlace(a, b) {
        a[0] += b[0], a[1] += b[1], a[2] += b[2];
      }
      function cartesianScale(vector, k) {
        return [vector[0] * k, vector[1] * k, vector[2] * k];
      }
      function cartesianNormalizeInPlace(d) {
        var l = sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
        d[0] /= l, d[1] /= l, d[2] /= l;
      }
      var lambda0$1, phi0, lambda1, phi1, lambda2, lambda00$1, phi00$1, p0, deltaSum, ranges, range;
      var boundsStream = {
        point: boundsPoint,
        lineStart: boundsLineStart,
        lineEnd: boundsLineEnd,
        polygonStart: function() {
          boundsStream.point = boundsRingPoint;
          boundsStream.lineStart = boundsRingStart;
          boundsStream.lineEnd = boundsRingEnd;
          deltaSum = new d3Array.Adder();
          areaStream.polygonStart();
        },
        polygonEnd: function() {
          areaStream.polygonEnd();
          boundsStream.point = boundsPoint;
          boundsStream.lineStart = boundsLineStart;
          boundsStream.lineEnd = boundsLineEnd;
          if (areaRingSum < 0) lambda0$1 = -(lambda1 = 180), phi0 = -(phi1 = 90);
          else if (deltaSum > epsilon) phi1 = 90;
          else if (deltaSum < -epsilon) phi0 = -90;
          range[0] = lambda0$1, range[1] = lambda1;
        },
        sphere: function() {
          lambda0$1 = -(lambda1 = 180), phi0 = -(phi1 = 90);
        }
      };
      function boundsPoint(lambda, phi) {
        ranges.push(range = [lambda0$1 = lambda, lambda1 = lambda]);
        if (phi < phi0) phi0 = phi;
        if (phi > phi1) phi1 = phi;
      }
      function linePoint(lambda, phi) {
        var p = cartesian([lambda * radians, phi * radians]);
        if (p0) {
          var normal = cartesianCross(p0, p), equatorial = [normal[1], -normal[0], 0], inflection = cartesianCross(equatorial, normal);
          cartesianNormalizeInPlace(inflection);
          inflection = spherical(inflection);
          var delta = lambda - lambda2, sign2 = delta > 0 ? 1 : -1, lambdai = inflection[0] * degrees * sign2, phii, antimeridian = abs(delta) > 180;
          if (antimeridian ^ (sign2 * lambda2 < lambdai && lambdai < sign2 * lambda)) {
            phii = inflection[1] * degrees;
            if (phii > phi1) phi1 = phii;
          } else if (lambdai = (lambdai + 360) % 360 - 180, antimeridian ^ (sign2 * lambda2 < lambdai && lambdai < sign2 * lambda)) {
            phii = -inflection[1] * degrees;
            if (phii < phi0) phi0 = phii;
          } else {
            if (phi < phi0) phi0 = phi;
            if (phi > phi1) phi1 = phi;
          }
          if (antimeridian) {
            if (lambda < lambda2) {
              if (angle(lambda0$1, lambda) > angle(lambda0$1, lambda1)) lambda1 = lambda;
            } else {
              if (angle(lambda, lambda1) > angle(lambda0$1, lambda1)) lambda0$1 = lambda;
            }
          } else {
            if (lambda1 >= lambda0$1) {
              if (lambda < lambda0$1) lambda0$1 = lambda;
              if (lambda > lambda1) lambda1 = lambda;
            } else {
              if (lambda > lambda2) {
                if (angle(lambda0$1, lambda) > angle(lambda0$1, lambda1)) lambda1 = lambda;
              } else {
                if (angle(lambda, lambda1) > angle(lambda0$1, lambda1)) lambda0$1 = lambda;
              }
            }
          }
        } else {
          ranges.push(range = [lambda0$1 = lambda, lambda1 = lambda]);
        }
        if (phi < phi0) phi0 = phi;
        if (phi > phi1) phi1 = phi;
        p0 = p, lambda2 = lambda;
      }
      function boundsLineStart() {
        boundsStream.point = linePoint;
      }
      function boundsLineEnd() {
        range[0] = lambda0$1, range[1] = lambda1;
        boundsStream.point = boundsPoint;
        p0 = null;
      }
      function boundsRingPoint(lambda, phi) {
        if (p0) {
          var delta = lambda - lambda2;
          deltaSum.add(abs(delta) > 180 ? delta + (delta > 0 ? 360 : -360) : delta);
        } else {
          lambda00$1 = lambda, phi00$1 = phi;
        }
        areaStream.point(lambda, phi);
        linePoint(lambda, phi);
      }
      function boundsRingStart() {
        areaStream.lineStart();
      }
      function boundsRingEnd() {
        boundsRingPoint(lambda00$1, phi00$1);
        areaStream.lineEnd();
        if (abs(deltaSum) > epsilon) lambda0$1 = -(lambda1 = 180);
        range[0] = lambda0$1, range[1] = lambda1;
        p0 = null;
      }
      function angle(lambda02, lambda12) {
        return (lambda12 -= lambda02) < 0 ? lambda12 + 360 : lambda12;
      }
      function rangeCompare(a, b) {
        return a[0] - b[0];
      }
      function rangeContains(range2, x) {
        return range2[0] <= range2[1] ? range2[0] <= x && x <= range2[1] : x < range2[0] || range2[1] < x;
      }
      function bounds(feature2) {
        var i, n, a, b, merged, deltaMax, delta;
        phi1 = lambda1 = -(lambda0$1 = phi0 = Infinity);
        ranges = [];
        geoStream(feature2, boundsStream);
        if (n = ranges.length) {
          ranges.sort(rangeCompare);
          for (i = 1, a = ranges[0], merged = [a]; i < n; ++i) {
            b = ranges[i];
            if (rangeContains(a, b[0]) || rangeContains(a, b[1])) {
              if (angle(a[0], b[1]) > angle(a[0], a[1])) a[1] = b[1];
              if (angle(b[0], a[1]) > angle(a[0], a[1])) a[0] = b[0];
            } else {
              merged.push(a = b);
            }
          }
          for (deltaMax = -Infinity, n = merged.length - 1, i = 0, a = merged[n]; i <= n; a = b, ++i) {
            b = merged[i];
            if ((delta = angle(a[1], b[0])) > deltaMax) deltaMax = delta, lambda0$1 = b[0], lambda1 = a[1];
          }
        }
        ranges = range = null;
        return lambda0$1 === Infinity || phi0 === Infinity ? [[NaN, NaN], [NaN, NaN]] : [[lambda0$1, phi0], [lambda1, phi1]];
      }
      var W0, W1, X0, Y0, Z0, X1, Y1, Z1, X2, Y2, Z2, lambda00$2, phi00$2, x0, y0, z0;
      var centroidStream = {
        sphere: noop,
        point: centroidPoint,
        lineStart: centroidLineStart,
        lineEnd: centroidLineEnd,
        polygonStart: function() {
          centroidStream.lineStart = centroidRingStart;
          centroidStream.lineEnd = centroidRingEnd;
        },
        polygonEnd: function() {
          centroidStream.lineStart = centroidLineStart;
          centroidStream.lineEnd = centroidLineEnd;
        }
      };
      function centroidPoint(lambda, phi) {
        lambda *= radians, phi *= radians;
        var cosPhi = cos(phi);
        centroidPointCartesian(cosPhi * cos(lambda), cosPhi * sin(lambda), sin(phi));
      }
      function centroidPointCartesian(x, y, z) {
        ++W0;
        X0 += (x - X0) / W0;
        Y0 += (y - Y0) / W0;
        Z0 += (z - Z0) / W0;
      }
      function centroidLineStart() {
        centroidStream.point = centroidLinePointFirst;
      }
      function centroidLinePointFirst(lambda, phi) {
        lambda *= radians, phi *= radians;
        var cosPhi = cos(phi);
        x0 = cosPhi * cos(lambda);
        y0 = cosPhi * sin(lambda);
        z0 = sin(phi);
        centroidStream.point = centroidLinePoint;
        centroidPointCartesian(x0, y0, z0);
      }
      function centroidLinePoint(lambda, phi) {
        lambda *= radians, phi *= radians;
        var cosPhi = cos(phi), x = cosPhi * cos(lambda), y = cosPhi * sin(lambda), z = sin(phi), w = atan2(sqrt((w = y0 * z - z0 * y) * w + (w = z0 * x - x0 * z) * w + (w = x0 * y - y0 * x) * w), x0 * x + y0 * y + z0 * z);
        W1 += w;
        X1 += w * (x0 + (x0 = x));
        Y1 += w * (y0 + (y0 = y));
        Z1 += w * (z0 + (z0 = z));
        centroidPointCartesian(x0, y0, z0);
      }
      function centroidLineEnd() {
        centroidStream.point = centroidPoint;
      }
      function centroidRingStart() {
        centroidStream.point = centroidRingPointFirst;
      }
      function centroidRingEnd() {
        centroidRingPoint(lambda00$2, phi00$2);
        centroidStream.point = centroidPoint;
      }
      function centroidRingPointFirst(lambda, phi) {
        lambda00$2 = lambda, phi00$2 = phi;
        lambda *= radians, phi *= radians;
        centroidStream.point = centroidRingPoint;
        var cosPhi = cos(phi);
        x0 = cosPhi * cos(lambda);
        y0 = cosPhi * sin(lambda);
        z0 = sin(phi);
        centroidPointCartesian(x0, y0, z0);
      }
      function centroidRingPoint(lambda, phi) {
        lambda *= radians, phi *= radians;
        var cosPhi = cos(phi), x = cosPhi * cos(lambda), y = cosPhi * sin(lambda), z = sin(phi), cx = y0 * z - z0 * y, cy = z0 * x - x0 * z, cz = x0 * y - y0 * x, m = hypot(cx, cy, cz), w = asin(m), v = m && -w / m;
        X2.add(v * cx);
        Y2.add(v * cy);
        Z2.add(v * cz);
        W1 += w;
        X1 += w * (x0 + (x0 = x));
        Y1 += w * (y0 + (y0 = y));
        Z1 += w * (z0 + (z0 = z));
        centroidPointCartesian(x0, y0, z0);
      }
      function centroid(object3) {
        W0 = W1 = X0 = Y0 = Z0 = X1 = Y1 = Z1 = 0;
        X2 = new d3Array.Adder();
        Y2 = new d3Array.Adder();
        Z2 = new d3Array.Adder();
        geoStream(object3, centroidStream);
        var x = +X2, y = +Y2, z = +Z2, m = hypot(x, y, z);
        if (m < epsilon2) {
          x = X1, y = Y1, z = Z1;
          if (W1 < epsilon) x = X0, y = Y0, z = Z0;
          m = hypot(x, y, z);
          if (m < epsilon2) return [NaN, NaN];
        }
        return [atan2(y, x) * degrees, asin(z / m) * degrees];
      }
      function constant(x) {
        return function() {
          return x;
        };
      }
      function compose(a, b) {
        function compose2(x, y) {
          return x = a(x, y), b(x[0], x[1]);
        }
        if (a.invert && b.invert) compose2.invert = function(x, y) {
          return x = b.invert(x, y), x && a.invert(x[0], x[1]);
        };
        return compose2;
      }
      function rotationIdentity(lambda, phi) {
        return [abs(lambda) > pi ? lambda + Math.round(-lambda / tau) * tau : lambda, phi];
      }
      rotationIdentity.invert = rotationIdentity;
      function rotateRadians(deltaLambda, deltaPhi, deltaGamma) {
        return (deltaLambda %= tau) ? deltaPhi || deltaGamma ? compose(rotationLambda(deltaLambda), rotationPhiGamma(deltaPhi, deltaGamma)) : rotationLambda(deltaLambda) : deltaPhi || deltaGamma ? rotationPhiGamma(deltaPhi, deltaGamma) : rotationIdentity;
      }
      function forwardRotationLambda(deltaLambda) {
        return function(lambda, phi) {
          return lambda += deltaLambda, [lambda > pi ? lambda - tau : lambda < -pi ? lambda + tau : lambda, phi];
        };
      }
      function rotationLambda(deltaLambda) {
        var rotation2 = forwardRotationLambda(deltaLambda);
        rotation2.invert = forwardRotationLambda(-deltaLambda);
        return rotation2;
      }
      function rotationPhiGamma(deltaPhi, deltaGamma) {
        var cosDeltaPhi = cos(deltaPhi), sinDeltaPhi = sin(deltaPhi), cosDeltaGamma = cos(deltaGamma), sinDeltaGamma = sin(deltaGamma);
        function rotation2(lambda, phi) {
          var cosPhi = cos(phi), x = cos(lambda) * cosPhi, y = sin(lambda) * cosPhi, z = sin(phi), k = z * cosDeltaPhi + x * sinDeltaPhi;
          return [
            atan2(y * cosDeltaGamma - k * sinDeltaGamma, x * cosDeltaPhi - z * sinDeltaPhi),
            asin(k * cosDeltaGamma + y * sinDeltaGamma)
          ];
        }
        rotation2.invert = function(lambda, phi) {
          var cosPhi = cos(phi), x = cos(lambda) * cosPhi, y = sin(lambda) * cosPhi, z = sin(phi), k = z * cosDeltaGamma - y * sinDeltaGamma;
          return [
            atan2(y * cosDeltaGamma + z * sinDeltaGamma, x * cosDeltaPhi + k * sinDeltaPhi),
            asin(k * cosDeltaPhi - x * sinDeltaPhi)
          ];
        };
        return rotation2;
      }
      function rotation(rotate) {
        rotate = rotateRadians(rotate[0] * radians, rotate[1] * radians, rotate.length > 2 ? rotate[2] * radians : 0);
        function forward(coordinates2) {
          coordinates2 = rotate(coordinates2[0] * radians, coordinates2[1] * radians);
          return coordinates2[0] *= degrees, coordinates2[1] *= degrees, coordinates2;
        }
        forward.invert = function(coordinates2) {
          coordinates2 = rotate.invert(coordinates2[0] * radians, coordinates2[1] * radians);
          return coordinates2[0] *= degrees, coordinates2[1] *= degrees, coordinates2;
        };
        return forward;
      }
      function circleStream(stream, radius, delta, direction, t0, t1) {
        if (!delta) return;
        var cosRadius = cos(radius), sinRadius = sin(radius), step = direction * delta;
        if (t0 == null) {
          t0 = radius + direction * tau;
          t1 = radius - step / 2;
        } else {
          t0 = circleRadius(cosRadius, t0);
          t1 = circleRadius(cosRadius, t1);
          if (direction > 0 ? t0 < t1 : t0 > t1) t0 += direction * tau;
        }
        for (var point, t = t0; direction > 0 ? t > t1 : t < t1; t -= step) {
          point = spherical([cosRadius, -sinRadius * cos(t), -sinRadius * sin(t)]);
          stream.point(point[0], point[1]);
        }
      }
      function circleRadius(cosRadius, point) {
        point = cartesian(point), point[0] -= cosRadius;
        cartesianNormalizeInPlace(point);
        var radius = acos(-point[1]);
        return ((-point[2] < 0 ? -radius : radius) + tau - epsilon) % tau;
      }
      function circle() {
        var center = constant([0, 0]), radius = constant(90), precision = constant(6), ring, rotate, stream = { point };
        function point(x, y) {
          ring.push(x = rotate(x, y));
          x[0] *= degrees, x[1] *= degrees;
        }
        function circle2() {
          var c = center.apply(this, arguments), r = radius.apply(this, arguments) * radians, p = precision.apply(this, arguments) * radians;
          ring = [];
          rotate = rotateRadians(-c[0] * radians, -c[1] * radians, 0).invert;
          circleStream(stream, r, p, 1);
          c = { type: "Polygon", coordinates: [ring] };
          ring = rotate = null;
          return c;
        }
        circle2.center = function(_) {
          return arguments.length ? (center = typeof _ === "function" ? _ : constant([+_[0], +_[1]]), circle2) : center;
        };
        circle2.radius = function(_) {
          return arguments.length ? (radius = typeof _ === "function" ? _ : constant(+_), circle2) : radius;
        };
        circle2.precision = function(_) {
          return arguments.length ? (precision = typeof _ === "function" ? _ : constant(+_), circle2) : precision;
        };
        return circle2;
      }
      function clipBuffer() {
        var lines = [], line;
        return {
          point: function(x, y, m) {
            line.push([x, y, m]);
          },
          lineStart: function() {
            lines.push(line = []);
          },
          lineEnd: noop,
          rejoin: function() {
            if (lines.length > 1) lines.push(lines.pop().concat(lines.shift()));
          },
          result: function() {
            var result = lines;
            lines = [];
            line = null;
            return result;
          }
        };
      }
      function pointEqual(a, b) {
        return abs(a[0] - b[0]) < epsilon && abs(a[1] - b[1]) < epsilon;
      }
      function Intersection(point, points, other, entry) {
        this.x = point;
        this.z = points;
        this.o = other;
        this.e = entry;
        this.v = false;
        this.n = this.p = null;
      }
      function clipRejoin(segments, compareIntersection2, startInside, interpolate2, stream) {
        var subject = [], clip2 = [], i, n;
        segments.forEach(function(segment) {
          if ((n2 = segment.length - 1) <= 0) return;
          var n2, p02 = segment[0], p1 = segment[n2], x;
          if (pointEqual(p02, p1)) {
            if (!p02[2] && !p1[2]) {
              stream.lineStart();
              for (i = 0; i < n2; ++i) stream.point((p02 = segment[i])[0], p02[1]);
              stream.lineEnd();
              return;
            }
            p1[0] += 2 * epsilon;
          }
          subject.push(x = new Intersection(p02, segment, null, true));
          clip2.push(x.o = new Intersection(p02, null, x, false));
          subject.push(x = new Intersection(p1, segment, null, false));
          clip2.push(x.o = new Intersection(p1, null, x, true));
        });
        if (!subject.length) return;
        clip2.sort(compareIntersection2);
        link(subject);
        link(clip2);
        for (i = 0, n = clip2.length; i < n; ++i) {
          clip2[i].e = startInside = !startInside;
        }
        var start = subject[0], points, point;
        while (1) {
          var current = start, isSubject = true;
          while (current.v) if ((current = current.n) === start) return;
          points = current.z;
          stream.lineStart();
          do {
            current.v = current.o.v = true;
            if (current.e) {
              if (isSubject) {
                for (i = 0, n = points.length; i < n; ++i) stream.point((point = points[i])[0], point[1]);
              } else {
                interpolate2(current.x, current.n.x, 1, stream);
              }
              current = current.n;
            } else {
              if (isSubject) {
                points = current.p.z;
                for (i = points.length - 1; i >= 0; --i) stream.point((point = points[i])[0], point[1]);
              } else {
                interpolate2(current.x, current.p.x, -1, stream);
              }
              current = current.p;
            }
            current = current.o;
            points = current.z;
            isSubject = !isSubject;
          } while (!current.v);
          stream.lineEnd();
        }
      }
      function link(array2) {
        if (!(n = array2.length)) return;
        var n, i = 0, a = array2[0], b;
        while (++i < n) {
          a.n = b = array2[i];
          b.p = a;
          a = b;
        }
        a.n = b = array2[0];
        b.p = a;
      }
      function longitude(point) {
        if (abs(point[0]) <= pi)
          return point[0];
        else
          return sign(point[0]) * ((abs(point[0]) + pi) % tau - pi);
      }
      function polygonContains(polygon, point) {
        var lambda = longitude(point), phi = point[1], sinPhi = sin(phi), normal = [sin(lambda), -cos(lambda), 0], angle2 = 0, winding = 0;
        var sum = new d3Array.Adder();
        if (sinPhi === 1) phi = halfPi + epsilon;
        else if (sinPhi === -1) phi = -halfPi - epsilon;
        for (var i = 0, n = polygon.length; i < n; ++i) {
          if (!(m = (ring = polygon[i]).length)) continue;
          var ring, m, point0 = ring[m - 1], lambda02 = longitude(point0), phi02 = point0[1] / 2 + quarterPi, sinPhi02 = sin(phi02), cosPhi02 = cos(phi02);
          for (var j = 0; j < m; ++j, lambda02 = lambda12, sinPhi02 = sinPhi1, cosPhi02 = cosPhi1, point0 = point1) {
            var point1 = ring[j], lambda12 = longitude(point1), phi12 = point1[1] / 2 + quarterPi, sinPhi1 = sin(phi12), cosPhi1 = cos(phi12), delta = lambda12 - lambda02, sign2 = delta >= 0 ? 1 : -1, absDelta = sign2 * delta, antimeridian = absDelta > pi, k = sinPhi02 * sinPhi1;
            sum.add(atan2(k * sign2 * sin(absDelta), cosPhi02 * cosPhi1 + k * cos(absDelta)));
            angle2 += antimeridian ? delta + sign2 * tau : delta;
            if (antimeridian ^ lambda02 >= lambda ^ lambda12 >= lambda) {
              var arc = cartesianCross(cartesian(point0), cartesian(point1));
              cartesianNormalizeInPlace(arc);
              var intersection = cartesianCross(normal, arc);
              cartesianNormalizeInPlace(intersection);
              var phiArc = (antimeridian ^ delta >= 0 ? -1 : 1) * asin(intersection[2]);
              if (phi > phiArc || phi === phiArc && (arc[0] || arc[1])) {
                winding += antimeridian ^ delta >= 0 ? 1 : -1;
              }
            }
          }
        }
        return (angle2 < -epsilon || angle2 < epsilon && sum < -epsilon2) ^ winding & 1;
      }
      function clip(pointVisible, clipLine2, interpolate2, start) {
        return function(sink) {
          var line = clipLine2(sink), ringBuffer = clipBuffer(), ringSink = clipLine2(ringBuffer), polygonStarted = false, polygon, segments, ring;
          var clip2 = {
            point,
            lineStart,
            lineEnd,
            polygonStart: function() {
              clip2.point = pointRing;
              clip2.lineStart = ringStart;
              clip2.lineEnd = ringEnd;
              segments = [];
              polygon = [];
            },
            polygonEnd: function() {
              clip2.point = point;
              clip2.lineStart = lineStart;
              clip2.lineEnd = lineEnd;
              segments = d3Array.merge(segments);
              var startInside = polygonContains(polygon, start);
              if (segments.length) {
                if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
                clipRejoin(segments, compareIntersection, startInside, interpolate2, sink);
              } else if (startInside) {
                if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
                sink.lineStart();
                interpolate2(null, null, 1, sink);
                sink.lineEnd();
              }
              if (polygonStarted) sink.polygonEnd(), polygonStarted = false;
              segments = polygon = null;
            },
            sphere: function() {
              sink.polygonStart();
              sink.lineStart();
              interpolate2(null, null, 1, sink);
              sink.lineEnd();
              sink.polygonEnd();
            }
          };
          function point(lambda, phi) {
            if (pointVisible(lambda, phi)) sink.point(lambda, phi);
          }
          function pointLine(lambda, phi) {
            line.point(lambda, phi);
          }
          function lineStart() {
            clip2.point = pointLine;
            line.lineStart();
          }
          function lineEnd() {
            clip2.point = point;
            line.lineEnd();
          }
          function pointRing(lambda, phi) {
            ring.push([lambda, phi]);
            ringSink.point(lambda, phi);
          }
          function ringStart() {
            ringSink.lineStart();
            ring = [];
          }
          function ringEnd() {
            pointRing(ring[0][0], ring[0][1]);
            ringSink.lineEnd();
            var clean = ringSink.clean(), ringSegments = ringBuffer.result(), i, n = ringSegments.length, m, segment, point2;
            ring.pop();
            polygon.push(ring);
            ring = null;
            if (!n) return;
            if (clean & 1) {
              segment = ringSegments[0];
              if ((m = segment.length - 1) > 0) {
                if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
                sink.lineStart();
                for (i = 0; i < m; ++i) sink.point((point2 = segment[i])[0], point2[1]);
                sink.lineEnd();
              }
              return;
            }
            if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));
            segments.push(ringSegments.filter(validSegment));
          }
          return clip2;
        };
      }
      function validSegment(segment) {
        return segment.length > 1;
      }
      function compareIntersection(a, b) {
        return ((a = a.x)[0] < 0 ? a[1] - halfPi - epsilon : halfPi - a[1]) - ((b = b.x)[0] < 0 ? b[1] - halfPi - epsilon : halfPi - b[1]);
      }
      var clipAntimeridian = clip(
        function() {
          return true;
        },
        clipAntimeridianLine,
        clipAntimeridianInterpolate,
        [-pi, -halfPi]
      );
      function clipAntimeridianLine(stream) {
        var lambda02 = NaN, phi02 = NaN, sign0 = NaN, clean;
        return {
          lineStart: function() {
            stream.lineStart();
            clean = 1;
          },
          point: function(lambda12, phi12) {
            var sign1 = lambda12 > 0 ? pi : -pi, delta = abs(lambda12 - lambda02);
            if (abs(delta - pi) < epsilon) {
              stream.point(lambda02, phi02 = (phi02 + phi12) / 2 > 0 ? halfPi : -halfPi);
              stream.point(sign0, phi02);
              stream.lineEnd();
              stream.lineStart();
              stream.point(sign1, phi02);
              stream.point(lambda12, phi02);
              clean = 0;
            } else if (sign0 !== sign1 && delta >= pi) {
              if (abs(lambda02 - sign0) < epsilon) lambda02 -= sign0 * epsilon;
              if (abs(lambda12 - sign1) < epsilon) lambda12 -= sign1 * epsilon;
              phi02 = clipAntimeridianIntersect(lambda02, phi02, lambda12, phi12);
              stream.point(sign0, phi02);
              stream.lineEnd();
              stream.lineStart();
              stream.point(sign1, phi02);
              clean = 0;
            }
            stream.point(lambda02 = lambda12, phi02 = phi12);
            sign0 = sign1;
          },
          lineEnd: function() {
            stream.lineEnd();
            lambda02 = phi02 = NaN;
          },
          clean: function() {
            return 2 - clean;
          }
        };
      }
      function clipAntimeridianIntersect(lambda02, phi02, lambda12, phi12) {
        var cosPhi02, cosPhi1, sinLambda0Lambda1 = sin(lambda02 - lambda12);
        return abs(sinLambda0Lambda1) > epsilon ? atan((sin(phi02) * (cosPhi1 = cos(phi12)) * sin(lambda12) - sin(phi12) * (cosPhi02 = cos(phi02)) * sin(lambda02)) / (cosPhi02 * cosPhi1 * sinLambda0Lambda1)) : (phi02 + phi12) / 2;
      }
      function clipAntimeridianInterpolate(from, to, direction, stream) {
        var phi;
        if (from == null) {
          phi = direction * halfPi;
          stream.point(-pi, phi);
          stream.point(0, phi);
          stream.point(pi, phi);
          stream.point(pi, 0);
          stream.point(pi, -phi);
          stream.point(0, -phi);
          stream.point(-pi, -phi);
          stream.point(-pi, 0);
          stream.point(-pi, phi);
        } else if (abs(from[0] - to[0]) > epsilon) {
          var lambda = from[0] < to[0] ? pi : -pi;
          phi = direction * lambda / 2;
          stream.point(-lambda, phi);
          stream.point(0, phi);
          stream.point(lambda, phi);
        } else {
          stream.point(to[0], to[1]);
        }
      }
      function clipCircle(radius) {
        var cr = cos(radius), delta = 6 * radians, smallRadius = cr > 0, notHemisphere = abs(cr) > epsilon;
        function interpolate2(from, to, direction, stream) {
          circleStream(stream, radius, delta, direction, from, to);
        }
        function visible(lambda, phi) {
          return cos(lambda) * cos(phi) > cr;
        }
        function clipLine2(stream) {
          var point0, c0, v0, v00, clean;
          return {
            lineStart: function() {
              v00 = v0 = false;
              clean = 1;
            },
            point: function(lambda, phi) {
              var point1 = [lambda, phi], point2, v = visible(lambda, phi), c = smallRadius ? v ? 0 : code(lambda, phi) : v ? code(lambda + (lambda < 0 ? pi : -pi), phi) : 0;
              if (!point0 && (v00 = v0 = v)) stream.lineStart();
              if (v !== v0) {
                point2 = intersect(point0, point1);
                if (!point2 || pointEqual(point0, point2) || pointEqual(point1, point2))
                  point1[2] = 1;
              }
              if (v !== v0) {
                clean = 0;
                if (v) {
                  stream.lineStart();
                  point2 = intersect(point1, point0);
                  stream.point(point2[0], point2[1]);
                } else {
                  point2 = intersect(point0, point1);
                  stream.point(point2[0], point2[1], 2);
                  stream.lineEnd();
                }
                point0 = point2;
              } else if (notHemisphere && point0 && smallRadius ^ v) {
                var t;
                if (!(c & c0) && (t = intersect(point1, point0, true))) {
                  clean = 0;
                  if (smallRadius) {
                    stream.lineStart();
                    stream.point(t[0][0], t[0][1]);
                    stream.point(t[1][0], t[1][1]);
                    stream.lineEnd();
                  } else {
                    stream.point(t[1][0], t[1][1]);
                    stream.lineEnd();
                    stream.lineStart();
                    stream.point(t[0][0], t[0][1], 3);
                  }
                }
              }
              if (v && (!point0 || !pointEqual(point0, point1))) {
                stream.point(point1[0], point1[1]);
              }
              point0 = point1, v0 = v, c0 = c;
            },
            lineEnd: function() {
              if (v0) stream.lineEnd();
              point0 = null;
            },
            // Rejoin first and last segments if there were intersections and the first
            // and last points were visible.
            clean: function() {
              return clean | (v00 && v0) << 1;
            }
          };
        }
        function intersect(a, b, two) {
          var pa = cartesian(a), pb = cartesian(b);
          var n1 = [1, 0, 0], n2 = cartesianCross(pa, pb), n2n2 = cartesianDot(n2, n2), n1n2 = n2[0], determinant = n2n2 - n1n2 * n1n2;
          if (!determinant) return !two && a;
          var c1 = cr * n2n2 / determinant, c2 = -cr * n1n2 / determinant, n1xn2 = cartesianCross(n1, n2), A = cartesianScale(n1, c1), B = cartesianScale(n2, c2);
          cartesianAddInPlace(A, B);
          var u = n1xn2, w = cartesianDot(A, u), uu = cartesianDot(u, u), t2 = w * w - uu * (cartesianDot(A, A) - 1);
          if (t2 < 0) return;
          var t = sqrt(t2), q = cartesianScale(u, (-w - t) / uu);
          cartesianAddInPlace(q, A);
          q = spherical(q);
          if (!two) return q;
          var lambda02 = a[0], lambda12 = b[0], phi02 = a[1], phi12 = b[1], z;
          if (lambda12 < lambda02) z = lambda02, lambda02 = lambda12, lambda12 = z;
          var delta2 = lambda12 - lambda02, polar = abs(delta2 - pi) < epsilon, meridian = polar || delta2 < epsilon;
          if (!polar && phi12 < phi02) z = phi02, phi02 = phi12, phi12 = z;
          if (meridian ? polar ? phi02 + phi12 > 0 ^ q[1] < (abs(q[0] - lambda02) < epsilon ? phi02 : phi12) : phi02 <= q[1] && q[1] <= phi12 : delta2 > pi ^ (lambda02 <= q[0] && q[0] <= lambda12)) {
            var q1 = cartesianScale(u, (-w + t) / uu);
            cartesianAddInPlace(q1, A);
            return [q, spherical(q1)];
          }
        }
        function code(lambda, phi) {
          var r = smallRadius ? radius : pi - radius, code2 = 0;
          if (lambda < -r) code2 |= 1;
          else if (lambda > r) code2 |= 2;
          if (phi < -r) code2 |= 4;
          else if (phi > r) code2 |= 8;
          return code2;
        }
        return clip(visible, clipLine2, interpolate2, smallRadius ? [0, -radius] : [-pi, radius - pi]);
      }
      function clipLine(a, b, x02, y02, x12, y12) {
        var ax = a[0], ay = a[1], bx = b[0], by = b[1], t0 = 0, t1 = 1, dx = bx - ax, dy = by - ay, r;
        r = x02 - ax;
        if (!dx && r > 0) return;
        r /= dx;
        if (dx < 0) {
          if (r < t0) return;
          if (r < t1) t1 = r;
        } else if (dx > 0) {
          if (r > t1) return;
          if (r > t0) t0 = r;
        }
        r = x12 - ax;
        if (!dx && r < 0) return;
        r /= dx;
        if (dx < 0) {
          if (r > t1) return;
          if (r > t0) t0 = r;
        } else if (dx > 0) {
          if (r < t0) return;
          if (r < t1) t1 = r;
        }
        r = y02 - ay;
        if (!dy && r > 0) return;
        r /= dy;
        if (dy < 0) {
          if (r < t0) return;
          if (r < t1) t1 = r;
        } else if (dy > 0) {
          if (r > t1) return;
          if (r > t0) t0 = r;
        }
        r = y12 - ay;
        if (!dy && r < 0) return;
        r /= dy;
        if (dy < 0) {
          if (r > t1) return;
          if (r > t0) t0 = r;
        } else if (dy > 0) {
          if (r < t0) return;
          if (r < t1) t1 = r;
        }
        if (t0 > 0) a[0] = ax + t0 * dx, a[1] = ay + t0 * dy;
        if (t1 < 1) b[0] = ax + t1 * dx, b[1] = ay + t1 * dy;
        return true;
      }
      var clipMax = 1e9, clipMin = -clipMax;
      function clipRectangle(x02, y02, x12, y12) {
        function visible(x, y) {
          return x02 <= x && x <= x12 && y02 <= y && y <= y12;
        }
        function interpolate2(from, to, direction, stream) {
          var a = 0, a1 = 0;
          if (from == null || (a = corner(from, direction)) !== (a1 = corner(to, direction)) || comparePoint(from, to) < 0 ^ direction > 0) {
            do
              stream.point(a === 0 || a === 3 ? x02 : x12, a > 1 ? y12 : y02);
            while ((a = (a + direction + 4) % 4) !== a1);
          } else {
            stream.point(to[0], to[1]);
          }
        }
        function corner(p, direction) {
          return abs(p[0] - x02) < epsilon ? direction > 0 ? 0 : 3 : abs(p[0] - x12) < epsilon ? direction > 0 ? 2 : 1 : abs(p[1] - y02) < epsilon ? direction > 0 ? 1 : 0 : direction > 0 ? 3 : 2;
        }
        function compareIntersection2(a, b) {
          return comparePoint(a.x, b.x);
        }
        function comparePoint(a, b) {
          var ca = corner(a, 1), cb = corner(b, 1);
          return ca !== cb ? ca - cb : ca === 0 ? b[1] - a[1] : ca === 1 ? a[0] - b[0] : ca === 2 ? a[1] - b[1] : b[0] - a[0];
        }
        return function(stream) {
          var activeStream = stream, bufferStream = clipBuffer(), segments, polygon, ring, x__, y__, v__, x_, y_, v_, first, clean;
          var clipStream = {
            point,
            lineStart,
            lineEnd,
            polygonStart,
            polygonEnd
          };
          function point(x, y) {
            if (visible(x, y)) activeStream.point(x, y);
          }
          function polygonInside() {
            var winding = 0;
            for (var i = 0, n = polygon.length; i < n; ++i) {
              for (var ring2 = polygon[i], j = 1, m = ring2.length, point2 = ring2[0], a0, a1, b0 = point2[0], b1 = point2[1]; j < m; ++j) {
                a0 = b0, a1 = b1, point2 = ring2[j], b0 = point2[0], b1 = point2[1];
                if (a1 <= y12) {
                  if (b1 > y12 && (b0 - a0) * (y12 - a1) > (b1 - a1) * (x02 - a0)) ++winding;
                } else {
                  if (b1 <= y12 && (b0 - a0) * (y12 - a1) < (b1 - a1) * (x02 - a0)) --winding;
                }
              }
            }
            return winding;
          }
          function polygonStart() {
            activeStream = bufferStream, segments = [], polygon = [], clean = true;
          }
          function polygonEnd() {
            var startInside = polygonInside(), cleanInside = clean && startInside, visible2 = (segments = d3Array.merge(segments)).length;
            if (cleanInside || visible2) {
              stream.polygonStart();
              if (cleanInside) {
                stream.lineStart();
                interpolate2(null, null, 1, stream);
                stream.lineEnd();
              }
              if (visible2) {
                clipRejoin(segments, compareIntersection2, startInside, interpolate2, stream);
              }
              stream.polygonEnd();
            }
            activeStream = stream, segments = polygon = ring = null;
          }
          function lineStart() {
            clipStream.point = linePoint2;
            if (polygon) polygon.push(ring = []);
            first = true;
            v_ = false;
            x_ = y_ = NaN;
          }
          function lineEnd() {
            if (segments) {
              linePoint2(x__, y__);
              if (v__ && v_) bufferStream.rejoin();
              segments.push(bufferStream.result());
            }
            clipStream.point = point;
            if (v_) activeStream.lineEnd();
          }
          function linePoint2(x, y) {
            var v = visible(x, y);
            if (polygon) ring.push([x, y]);
            if (first) {
              x__ = x, y__ = y, v__ = v;
              first = false;
              if (v) {
                activeStream.lineStart();
                activeStream.point(x, y);
              }
            } else {
              if (v && v_) activeStream.point(x, y);
              else {
                var a = [x_ = Math.max(clipMin, Math.min(clipMax, x_)), y_ = Math.max(clipMin, Math.min(clipMax, y_))], b = [x = Math.max(clipMin, Math.min(clipMax, x)), y = Math.max(clipMin, Math.min(clipMax, y))];
                if (clipLine(a, b, x02, y02, x12, y12)) {
                  if (!v_) {
                    activeStream.lineStart();
                    activeStream.point(a[0], a[1]);
                  }
                  activeStream.point(b[0], b[1]);
                  if (!v) activeStream.lineEnd();
                  clean = false;
                } else if (v) {
                  activeStream.lineStart();
                  activeStream.point(x, y);
                  clean = false;
                }
              }
            }
            x_ = x, y_ = y, v_ = v;
          }
          return clipStream;
        };
      }
      function extent() {
        var x02 = 0, y02 = 0, x12 = 960, y12 = 500, cache, cacheStream, clip2;
        return clip2 = {
          stream: function(stream) {
            return cache && cacheStream === stream ? cache : cache = clipRectangle(x02, y02, x12, y12)(cacheStream = stream);
          },
          extent: function(_) {
            return arguments.length ? (x02 = +_[0][0], y02 = +_[0][1], x12 = +_[1][0], y12 = +_[1][1], cache = cacheStream = null, clip2) : [[x02, y02], [x12, y12]];
          }
        };
      }
      var lengthSum, lambda0$2, sinPhi0$1, cosPhi0$1;
      var lengthStream = {
        sphere: noop,
        point: noop,
        lineStart: lengthLineStart,
        lineEnd: noop,
        polygonStart: noop,
        polygonEnd: noop
      };
      function lengthLineStart() {
        lengthStream.point = lengthPointFirst;
        lengthStream.lineEnd = lengthLineEnd;
      }
      function lengthLineEnd() {
        lengthStream.point = lengthStream.lineEnd = noop;
      }
      function lengthPointFirst(lambda, phi) {
        lambda *= radians, phi *= radians;
        lambda0$2 = lambda, sinPhi0$1 = sin(phi), cosPhi0$1 = cos(phi);
        lengthStream.point = lengthPoint;
      }
      function lengthPoint(lambda, phi) {
        lambda *= radians, phi *= radians;
        var sinPhi = sin(phi), cosPhi = cos(phi), delta = abs(lambda - lambda0$2), cosDelta = cos(delta), sinDelta = sin(delta), x = cosPhi * sinDelta, y = cosPhi0$1 * sinPhi - sinPhi0$1 * cosPhi * cosDelta, z = sinPhi0$1 * sinPhi + cosPhi0$1 * cosPhi * cosDelta;
        lengthSum.add(atan2(sqrt(x * x + y * y), z));
        lambda0$2 = lambda, sinPhi0$1 = sinPhi, cosPhi0$1 = cosPhi;
      }
      function length(object3) {
        lengthSum = new d3Array.Adder();
        geoStream(object3, lengthStream);
        return +lengthSum;
      }
      var coordinates = [null, null], object2 = { type: "LineString", coordinates };
      function distance(a, b) {
        coordinates[0] = a;
        coordinates[1] = b;
        return length(object2);
      }
      var containsObjectType = {
        Feature: function(object3, point) {
          return containsGeometry(object3.geometry, point);
        },
        FeatureCollection: function(object3, point) {
          var features = object3.features, i = -1, n = features.length;
          while (++i < n) if (containsGeometry(features[i].geometry, point)) return true;
          return false;
        }
      };
      var containsGeometryType = {
        Sphere: function() {
          return true;
        },
        Point: function(object3, point) {
          return containsPoint(object3.coordinates, point);
        },
        MultiPoint: function(object3, point) {
          var coordinates2 = object3.coordinates, i = -1, n = coordinates2.length;
          while (++i < n) if (containsPoint(coordinates2[i], point)) return true;
          return false;
        },
        LineString: function(object3, point) {
          return containsLine(object3.coordinates, point);
        },
        MultiLineString: function(object3, point) {
          var coordinates2 = object3.coordinates, i = -1, n = coordinates2.length;
          while (++i < n) if (containsLine(coordinates2[i], point)) return true;
          return false;
        },
        Polygon: function(object3, point) {
          return containsPolygon(object3.coordinates, point);
        },
        MultiPolygon: function(object3, point) {
          var coordinates2 = object3.coordinates, i = -1, n = coordinates2.length;
          while (++i < n) if (containsPolygon(coordinates2[i], point)) return true;
          return false;
        },
        GeometryCollection: function(object3, point) {
          var geometries = object3.geometries, i = -1, n = geometries.length;
          while (++i < n) if (containsGeometry(geometries[i], point)) return true;
          return false;
        }
      };
      function containsGeometry(geometry, point) {
        return geometry && containsGeometryType.hasOwnProperty(geometry.type) ? containsGeometryType[geometry.type](geometry, point) : false;
      }
      function containsPoint(coordinates2, point) {
        return distance(coordinates2, point) === 0;
      }
      function containsLine(coordinates2, point) {
        var ao, bo, ab;
        for (var i = 0, n = coordinates2.length; i < n; i++) {
          bo = distance(coordinates2[i], point);
          if (bo === 0) return true;
          if (i > 0) {
            ab = distance(coordinates2[i], coordinates2[i - 1]);
            if (ab > 0 && ao <= ab && bo <= ab && (ao + bo - ab) * (1 - Math.pow((ao - bo) / ab, 2)) < epsilon2 * ab)
              return true;
          }
          ao = bo;
        }
        return false;
      }
      function containsPolygon(coordinates2, point) {
        return !!polygonContains(coordinates2.map(ringRadians), pointRadians(point));
      }
      function ringRadians(ring) {
        return ring = ring.map(pointRadians), ring.pop(), ring;
      }
      function pointRadians(point) {
        return [point[0] * radians, point[1] * radians];
      }
      function contains(object3, point) {
        return (object3 && containsObjectType.hasOwnProperty(object3.type) ? containsObjectType[object3.type] : containsGeometry)(object3, point);
      }
      function graticuleX(y02, y12, dy) {
        var y = d3Array.range(y02, y12 - epsilon, dy).concat(y12);
        return function(x) {
          return y.map(function(y2) {
            return [x, y2];
          });
        };
      }
      function graticuleY(x02, x12, dx) {
        var x = d3Array.range(x02, x12 - epsilon, dx).concat(x12);
        return function(y) {
          return x.map(function(x2) {
            return [x2, y];
          });
        };
      }
      function graticule() {
        var x12, x02, X12, X02, y12, y02, Y12, Y02, dx = 10, dy = dx, DX = 90, DY = 360, x, y, X, Y, precision = 2.5;
        function graticule2() {
          return { type: "MultiLineString", coordinates: lines() };
        }
        function lines() {
          return d3Array.range(ceil(X02 / DX) * DX, X12, DX).map(X).concat(d3Array.range(ceil(Y02 / DY) * DY, Y12, DY).map(Y)).concat(d3Array.range(ceil(x02 / dx) * dx, x12, dx).filter(function(x2) {
            return abs(x2 % DX) > epsilon;
          }).map(x)).concat(d3Array.range(ceil(y02 / dy) * dy, y12, dy).filter(function(y2) {
            return abs(y2 % DY) > epsilon;
          }).map(y));
        }
        graticule2.lines = function() {
          return lines().map(function(coordinates2) {
            return { type: "LineString", coordinates: coordinates2 };
          });
        };
        graticule2.outline = function() {
          return {
            type: "Polygon",
            coordinates: [
              X(X02).concat(
                Y(Y12).slice(1),
                X(X12).reverse().slice(1),
                Y(Y02).reverse().slice(1)
              )
            ]
          };
        };
        graticule2.extent = function(_) {
          if (!arguments.length) return graticule2.extentMinor();
          return graticule2.extentMajor(_).extentMinor(_);
        };
        graticule2.extentMajor = function(_) {
          if (!arguments.length) return [[X02, Y02], [X12, Y12]];
          X02 = +_[0][0], X12 = +_[1][0];
          Y02 = +_[0][1], Y12 = +_[1][1];
          if (X02 > X12) _ = X02, X02 = X12, X12 = _;
          if (Y02 > Y12) _ = Y02, Y02 = Y12, Y12 = _;
          return graticule2.precision(precision);
        };
        graticule2.extentMinor = function(_) {
          if (!arguments.length) return [[x02, y02], [x12, y12]];
          x02 = +_[0][0], x12 = +_[1][0];
          y02 = +_[0][1], y12 = +_[1][1];
          if (x02 > x12) _ = x02, x02 = x12, x12 = _;
          if (y02 > y12) _ = y02, y02 = y12, y12 = _;
          return graticule2.precision(precision);
        };
        graticule2.step = function(_) {
          if (!arguments.length) return graticule2.stepMinor();
          return graticule2.stepMajor(_).stepMinor(_);
        };
        graticule2.stepMajor = function(_) {
          if (!arguments.length) return [DX, DY];
          DX = +_[0], DY = +_[1];
          return graticule2;
        };
        graticule2.stepMinor = function(_) {
          if (!arguments.length) return [dx, dy];
          dx = +_[0], dy = +_[1];
          return graticule2;
        };
        graticule2.precision = function(_) {
          if (!arguments.length) return precision;
          precision = +_;
          x = graticuleX(y02, y12, 90);
          y = graticuleY(x02, x12, precision);
          X = graticuleX(Y02, Y12, 90);
          Y = graticuleY(X02, X12, precision);
          return graticule2;
        };
        return graticule2.extentMajor([[-180, -90 + epsilon], [180, 90 - epsilon]]).extentMinor([[-180, -80 - epsilon], [180, 80 + epsilon]]);
      }
      function graticule10() {
        return graticule()();
      }
      function interpolate(a, b) {
        var x02 = a[0] * radians, y02 = a[1] * radians, x12 = b[0] * radians, y12 = b[1] * radians, cy0 = cos(y02), sy0 = sin(y02), cy1 = cos(y12), sy1 = sin(y12), kx0 = cy0 * cos(x02), ky0 = cy0 * sin(x02), kx1 = cy1 * cos(x12), ky1 = cy1 * sin(x12), d = 2 * asin(sqrt(haversin(y12 - y02) + cy0 * cy1 * haversin(x12 - x02))), k = sin(d);
        var interpolate2 = d ? function(t) {
          var B = sin(t *= d) / k, A = sin(d - t) / k, x = A * kx0 + B * kx1, y = A * ky0 + B * ky1, z = A * sy0 + B * sy1;
          return [
            atan2(y, x) * degrees,
            atan2(z, sqrt(x * x + y * y)) * degrees
          ];
        } : function() {
          return [x02 * degrees, y02 * degrees];
        };
        interpolate2.distance = d;
        return interpolate2;
      }
      var identity = (x) => x;
      var areaSum$1 = new d3Array.Adder(), areaRingSum$1 = new d3Array.Adder(), x00, y00, x0$1, y0$1;
      var areaStream$1 = {
        point: noop,
        lineStart: noop,
        lineEnd: noop,
        polygonStart: function() {
          areaStream$1.lineStart = areaRingStart$1;
          areaStream$1.lineEnd = areaRingEnd$1;
        },
        polygonEnd: function() {
          areaStream$1.lineStart = areaStream$1.lineEnd = areaStream$1.point = noop;
          areaSum$1.add(abs(areaRingSum$1));
          areaRingSum$1 = new d3Array.Adder();
        },
        result: function() {
          var area2 = areaSum$1 / 2;
          areaSum$1 = new d3Array.Adder();
          return area2;
        }
      };
      function areaRingStart$1() {
        areaStream$1.point = areaPointFirst$1;
      }
      function areaPointFirst$1(x, y) {
        areaStream$1.point = areaPoint$1;
        x00 = x0$1 = x, y00 = y0$1 = y;
      }
      function areaPoint$1(x, y) {
        areaRingSum$1.add(y0$1 * x - x0$1 * y);
        x0$1 = x, y0$1 = y;
      }
      function areaRingEnd$1() {
        areaPoint$1(x00, y00);
      }
      var x0$2 = Infinity, y0$2 = x0$2, x1 = -x0$2, y1 = x1;
      var boundsStream$1 = {
        point: boundsPoint$1,
        lineStart: noop,
        lineEnd: noop,
        polygonStart: noop,
        polygonEnd: noop,
        result: function() {
          var bounds2 = [[x0$2, y0$2], [x1, y1]];
          x1 = y1 = -(y0$2 = x0$2 = Infinity);
          return bounds2;
        }
      };
      function boundsPoint$1(x, y) {
        if (x < x0$2) x0$2 = x;
        if (x > x1) x1 = x;
        if (y < y0$2) y0$2 = y;
        if (y > y1) y1 = y;
      }
      var X0$1 = 0, Y0$1 = 0, Z0$1 = 0, X1$1 = 0, Y1$1 = 0, Z1$1 = 0, X2$1 = 0, Y2$1 = 0, Z2$1 = 0, x00$1, y00$1, x0$3, y0$3;
      var centroidStream$1 = {
        point: centroidPoint$1,
        lineStart: centroidLineStart$1,
        lineEnd: centroidLineEnd$1,
        polygonStart: function() {
          centroidStream$1.lineStart = centroidRingStart$1;
          centroidStream$1.lineEnd = centroidRingEnd$1;
        },
        polygonEnd: function() {
          centroidStream$1.point = centroidPoint$1;
          centroidStream$1.lineStart = centroidLineStart$1;
          centroidStream$1.lineEnd = centroidLineEnd$1;
        },
        result: function() {
          var centroid2 = Z2$1 ? [X2$1 / Z2$1, Y2$1 / Z2$1] : Z1$1 ? [X1$1 / Z1$1, Y1$1 / Z1$1] : Z0$1 ? [X0$1 / Z0$1, Y0$1 / Z0$1] : [NaN, NaN];
          X0$1 = Y0$1 = Z0$1 = X1$1 = Y1$1 = Z1$1 = X2$1 = Y2$1 = Z2$1 = 0;
          return centroid2;
        }
      };
      function centroidPoint$1(x, y) {
        X0$1 += x;
        Y0$1 += y;
        ++Z0$1;
      }
      function centroidLineStart$1() {
        centroidStream$1.point = centroidPointFirstLine;
      }
      function centroidPointFirstLine(x, y) {
        centroidStream$1.point = centroidPointLine;
        centroidPoint$1(x0$3 = x, y0$3 = y);
      }
      function centroidPointLine(x, y) {
        var dx = x - x0$3, dy = y - y0$3, z = sqrt(dx * dx + dy * dy);
        X1$1 += z * (x0$3 + x) / 2;
        Y1$1 += z * (y0$3 + y) / 2;
        Z1$1 += z;
        centroidPoint$1(x0$3 = x, y0$3 = y);
      }
      function centroidLineEnd$1() {
        centroidStream$1.point = centroidPoint$1;
      }
      function centroidRingStart$1() {
        centroidStream$1.point = centroidPointFirstRing;
      }
      function centroidRingEnd$1() {
        centroidPointRing(x00$1, y00$1);
      }
      function centroidPointFirstRing(x, y) {
        centroidStream$1.point = centroidPointRing;
        centroidPoint$1(x00$1 = x0$3 = x, y00$1 = y0$3 = y);
      }
      function centroidPointRing(x, y) {
        var dx = x - x0$3, dy = y - y0$3, z = sqrt(dx * dx + dy * dy);
        X1$1 += z * (x0$3 + x) / 2;
        Y1$1 += z * (y0$3 + y) / 2;
        Z1$1 += z;
        z = y0$3 * x - x0$3 * y;
        X2$1 += z * (x0$3 + x);
        Y2$1 += z * (y0$3 + y);
        Z2$1 += z * 3;
        centroidPoint$1(x0$3 = x, y0$3 = y);
      }
      function PathContext(context) {
        this._context = context;
      }
      PathContext.prototype = {
        _radius: 4.5,
        pointRadius: function(_) {
          return this._radius = _, this;
        },
        polygonStart: function() {
          this._line = 0;
        },
        polygonEnd: function() {
          this._line = NaN;
        },
        lineStart: function() {
          this._point = 0;
        },
        lineEnd: function() {
          if (this._line === 0) this._context.closePath();
          this._point = NaN;
        },
        point: function(x, y) {
          switch (this._point) {
            case 0: {
              this._context.moveTo(x, y);
              this._point = 1;
              break;
            }
            case 1: {
              this._context.lineTo(x, y);
              break;
            }
            default: {
              this._context.moveTo(x + this._radius, y);
              this._context.arc(x, y, this._radius, 0, tau);
              break;
            }
          }
        },
        result: noop
      };
      var lengthSum$1 = new d3Array.Adder(), lengthRing, x00$2, y00$2, x0$4, y0$4;
      var lengthStream$1 = {
        point: noop,
        lineStart: function() {
          lengthStream$1.point = lengthPointFirst$1;
        },
        lineEnd: function() {
          if (lengthRing) lengthPoint$1(x00$2, y00$2);
          lengthStream$1.point = noop;
        },
        polygonStart: function() {
          lengthRing = true;
        },
        polygonEnd: function() {
          lengthRing = null;
        },
        result: function() {
          var length2 = +lengthSum$1;
          lengthSum$1 = new d3Array.Adder();
          return length2;
        }
      };
      function lengthPointFirst$1(x, y) {
        lengthStream$1.point = lengthPoint$1;
        x00$2 = x0$4 = x, y00$2 = y0$4 = y;
      }
      function lengthPoint$1(x, y) {
        x0$4 -= x, y0$4 -= y;
        lengthSum$1.add(sqrt(x0$4 * x0$4 + y0$4 * y0$4));
        x0$4 = x, y0$4 = y;
      }
      function PathString() {
        this._string = [];
      }
      PathString.prototype = {
        _radius: 4.5,
        _circle: circle$1(4.5),
        pointRadius: function(_) {
          if ((_ = +_) !== this._radius) this._radius = _, this._circle = null;
          return this;
        },
        polygonStart: function() {
          this._line = 0;
        },
        polygonEnd: function() {
          this._line = NaN;
        },
        lineStart: function() {
          this._point = 0;
        },
        lineEnd: function() {
          if (this._line === 0) this._string.push("Z");
          this._point = NaN;
        },
        point: function(x, y) {
          switch (this._point) {
            case 0: {
              this._string.push("M", x, ",", y);
              this._point = 1;
              break;
            }
            case 1: {
              this._string.push("L", x, ",", y);
              break;
            }
            default: {
              if (this._circle == null) this._circle = circle$1(this._radius);
              this._string.push("M", x, ",", y, this._circle);
              break;
            }
          }
        },
        result: function() {
          if (this._string.length) {
            var result = this._string.join("");
            this._string = [];
            return result;
          } else {
            return null;
          }
        }
      };
      function circle$1(radius) {
        return "m0," + radius + "a" + radius + "," + radius + " 0 1,1 0," + -2 * radius + "a" + radius + "," + radius + " 0 1,1 0," + 2 * radius + "z";
      }
      function index(projection2, context) {
        var pointRadius = 4.5, projectionStream, contextStream;
        function path(object3) {
          if (object3) {
            if (typeof pointRadius === "function") contextStream.pointRadius(+pointRadius.apply(this, arguments));
            geoStream(object3, projectionStream(contextStream));
          }
          return contextStream.result();
        }
        path.area = function(object3) {
          geoStream(object3, projectionStream(areaStream$1));
          return areaStream$1.result();
        };
        path.measure = function(object3) {
          geoStream(object3, projectionStream(lengthStream$1));
          return lengthStream$1.result();
        };
        path.bounds = function(object3) {
          geoStream(object3, projectionStream(boundsStream$1));
          return boundsStream$1.result();
        };
        path.centroid = function(object3) {
          geoStream(object3, projectionStream(centroidStream$1));
          return centroidStream$1.result();
        };
        path.projection = function(_) {
          return arguments.length ? (projectionStream = _ == null ? (projection2 = null, identity) : (projection2 = _).stream, path) : projection2;
        };
        path.context = function(_) {
          if (!arguments.length) return context;
          contextStream = _ == null ? (context = null, new PathString()) : new PathContext(context = _);
          if (typeof pointRadius !== "function") contextStream.pointRadius(pointRadius);
          return path;
        };
        path.pointRadius = function(_) {
          if (!arguments.length) return pointRadius;
          pointRadius = typeof _ === "function" ? _ : (contextStream.pointRadius(+_), +_);
          return path;
        };
        return path.projection(projection2).context(context);
      }
      function transform(methods) {
        return {
          stream: transformer(methods)
        };
      }
      function transformer(methods) {
        return function(stream) {
          var s = new TransformStream();
          for (var key in methods) s[key] = methods[key];
          s.stream = stream;
          return s;
        };
      }
      function TransformStream() {
      }
      TransformStream.prototype = {
        constructor: TransformStream,
        point: function(x, y) {
          this.stream.point(x, y);
        },
        sphere: function() {
          this.stream.sphere();
        },
        lineStart: function() {
          this.stream.lineStart();
        },
        lineEnd: function() {
          this.stream.lineEnd();
        },
        polygonStart: function() {
          this.stream.polygonStart();
        },
        polygonEnd: function() {
          this.stream.polygonEnd();
        }
      };
      function fit(projection2, fitBounds, object3) {
        var clip2 = projection2.clipExtent && projection2.clipExtent();
        projection2.scale(150).translate([0, 0]);
        if (clip2 != null) projection2.clipExtent(null);
        geoStream(object3, projection2.stream(boundsStream$1));
        fitBounds(boundsStream$1.result());
        if (clip2 != null) projection2.clipExtent(clip2);
        return projection2;
      }
      function fitExtent(projection2, extent2, object3) {
        return fit(projection2, function(b) {
          var w = extent2[1][0] - extent2[0][0], h = extent2[1][1] - extent2[0][1], k = Math.min(w / (b[1][0] - b[0][0]), h / (b[1][1] - b[0][1])), x = +extent2[0][0] + (w - k * (b[1][0] + b[0][0])) / 2, y = +extent2[0][1] + (h - k * (b[1][1] + b[0][1])) / 2;
          projection2.scale(150 * k).translate([x, y]);
        }, object3);
      }
      function fitSize(projection2, size, object3) {
        return fitExtent(projection2, [[0, 0], size], object3);
      }
      function fitWidth(projection2, width, object3) {
        return fit(projection2, function(b) {
          var w = +width, k = w / (b[1][0] - b[0][0]), x = (w - k * (b[1][0] + b[0][0])) / 2, y = -k * b[0][1];
          projection2.scale(150 * k).translate([x, y]);
        }, object3);
      }
      function fitHeight(projection2, height, object3) {
        return fit(projection2, function(b) {
          var h = +height, k = h / (b[1][1] - b[0][1]), x = -k * b[0][0], y = (h - k * (b[1][1] + b[0][1])) / 2;
          projection2.scale(150 * k).translate([x, y]);
        }, object3);
      }
      var maxDepth = 16, cosMinDistance = cos(30 * radians);
      function resample(project, delta2) {
        return +delta2 ? resample$1(project, delta2) : resampleNone(project);
      }
      function resampleNone(project) {
        return transformer({
          point: function(x, y) {
            x = project(x, y);
            this.stream.point(x[0], x[1]);
          }
        });
      }
      function resample$1(project, delta2) {
        function resampleLineTo(x02, y02, lambda02, a0, b0, c0, x12, y12, lambda12, a1, b1, c1, depth, stream) {
          var dx = x12 - x02, dy = y12 - y02, d2 = dx * dx + dy * dy;
          if (d2 > 4 * delta2 && depth--) {
            var a = a0 + a1, b = b0 + b1, c = c0 + c1, m = sqrt(a * a + b * b + c * c), phi2 = asin(c /= m), lambda22 = abs(abs(c) - 1) < epsilon || abs(lambda02 - lambda12) < epsilon ? (lambda02 + lambda12) / 2 : atan2(b, a), p = project(lambda22, phi2), x2 = p[0], y2 = p[1], dx2 = x2 - x02, dy2 = y2 - y02, dz = dy * dx2 - dx * dy2;
            if (dz * dz / d2 > delta2 || abs((dx * dx2 + dy * dy2) / d2 - 0.5) > 0.3 || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) {
              resampleLineTo(x02, y02, lambda02, a0, b0, c0, x2, y2, lambda22, a /= m, b /= m, c, depth, stream);
              stream.point(x2, y2);
              resampleLineTo(x2, y2, lambda22, a, b, c, x12, y12, lambda12, a1, b1, c1, depth, stream);
            }
          }
        }
        return function(stream) {
          var lambda002, x002, y002, a00, b00, c00, lambda02, x02, y02, a0, b0, c0;
          var resampleStream = {
            point,
            lineStart,
            lineEnd,
            polygonStart: function() {
              stream.polygonStart();
              resampleStream.lineStart = ringStart;
            },
            polygonEnd: function() {
              stream.polygonEnd();
              resampleStream.lineStart = lineStart;
            }
          };
          function point(x, y) {
            x = project(x, y);
            stream.point(x[0], x[1]);
          }
          function lineStart() {
            x02 = NaN;
            resampleStream.point = linePoint2;
            stream.lineStart();
          }
          function linePoint2(lambda, phi) {
            var c = cartesian([lambda, phi]), p = project(lambda, phi);
            resampleLineTo(x02, y02, lambda02, a0, b0, c0, x02 = p[0], y02 = p[1], lambda02 = lambda, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
            stream.point(x02, y02);
          }
          function lineEnd() {
            resampleStream.point = point;
            stream.lineEnd();
          }
          function ringStart() {
            lineStart();
            resampleStream.point = ringPoint;
            resampleStream.lineEnd = ringEnd;
          }
          function ringPoint(lambda, phi) {
            linePoint2(lambda002 = lambda, phi), x002 = x02, y002 = y02, a00 = a0, b00 = b0, c00 = c0;
            resampleStream.point = linePoint2;
          }
          function ringEnd() {
            resampleLineTo(x02, y02, lambda02, a0, b0, c0, x002, y002, lambda002, a00, b00, c00, maxDepth, stream);
            resampleStream.lineEnd = lineEnd;
            lineEnd();
          }
          return resampleStream;
        };
      }
      var transformRadians = transformer({
        point: function(x, y) {
          this.stream.point(x * radians, y * radians);
        }
      });
      function transformRotate(rotate) {
        return transformer({
          point: function(x, y) {
            var r = rotate(x, y);
            return this.stream.point(r[0], r[1]);
          }
        });
      }
      function scaleTranslate(k, dx, dy, sx, sy) {
        function transform2(x, y) {
          x *= sx;
          y *= sy;
          return [dx + k * x, dy - k * y];
        }
        transform2.invert = function(x, y) {
          return [(x - dx) / k * sx, (dy - y) / k * sy];
        };
        return transform2;
      }
      function scaleTranslateRotate(k, dx, dy, sx, sy, alpha) {
        if (!alpha) return scaleTranslate(k, dx, dy, sx, sy);
        var cosAlpha = cos(alpha), sinAlpha = sin(alpha), a = cosAlpha * k, b = sinAlpha * k, ai = cosAlpha / k, bi = sinAlpha / k, ci = (sinAlpha * dy - cosAlpha * dx) / k, fi = (sinAlpha * dx + cosAlpha * dy) / k;
        function transform2(x, y) {
          x *= sx;
          y *= sy;
          return [a * x - b * y + dx, dy - b * x - a * y];
        }
        transform2.invert = function(x, y) {
          return [sx * (ai * x - bi * y + ci), sy * (fi - bi * x - ai * y)];
        };
        return transform2;
      }
      function projection(project) {
        return projectionMutator(function() {
          return project;
        })();
      }
      function projectionMutator(projectAt) {
        var project, k = 150, x = 480, y = 250, lambda = 0, phi = 0, deltaLambda = 0, deltaPhi = 0, deltaGamma = 0, rotate, alpha = 0, sx = 1, sy = 1, theta = null, preclip = clipAntimeridian, x02 = null, y02, x12, y12, postclip = identity, delta2 = 0.5, projectResample, projectTransform, projectRotateTransform, cache, cacheStream;
        function projection2(point) {
          return projectRotateTransform(point[0] * radians, point[1] * radians);
        }
        function invert(point) {
          point = projectRotateTransform.invert(point[0], point[1]);
          return point && [point[0] * degrees, point[1] * degrees];
        }
        projection2.stream = function(stream) {
          return cache && cacheStream === stream ? cache : cache = transformRadians(transformRotate(rotate)(preclip(projectResample(postclip(cacheStream = stream)))));
        };
        projection2.preclip = function(_) {
          return arguments.length ? (preclip = _, theta = void 0, reset()) : preclip;
        };
        projection2.postclip = function(_) {
          return arguments.length ? (postclip = _, x02 = y02 = x12 = y12 = null, reset()) : postclip;
        };
        projection2.clipAngle = function(_) {
          return arguments.length ? (preclip = +_ ? clipCircle(theta = _ * radians) : (theta = null, clipAntimeridian), reset()) : theta * degrees;
        };
        projection2.clipExtent = function(_) {
          return arguments.length ? (postclip = _ == null ? (x02 = y02 = x12 = y12 = null, identity) : clipRectangle(x02 = +_[0][0], y02 = +_[0][1], x12 = +_[1][0], y12 = +_[1][1]), reset()) : x02 == null ? null : [[x02, y02], [x12, y12]];
        };
        projection2.scale = function(_) {
          return arguments.length ? (k = +_, recenter()) : k;
        };
        projection2.translate = function(_) {
          return arguments.length ? (x = +_[0], y = +_[1], recenter()) : [x, y];
        };
        projection2.center = function(_) {
          return arguments.length ? (lambda = _[0] % 360 * radians, phi = _[1] % 360 * radians, recenter()) : [lambda * degrees, phi * degrees];
        };
        projection2.rotate = function(_) {
          return arguments.length ? (deltaLambda = _[0] % 360 * radians, deltaPhi = _[1] % 360 * radians, deltaGamma = _.length > 2 ? _[2] % 360 * radians : 0, recenter()) : [deltaLambda * degrees, deltaPhi * degrees, deltaGamma * degrees];
        };
        projection2.angle = function(_) {
          return arguments.length ? (alpha = _ % 360 * radians, recenter()) : alpha * degrees;
        };
        projection2.reflectX = function(_) {
          return arguments.length ? (sx = _ ? -1 : 1, recenter()) : sx < 0;
        };
        projection2.reflectY = function(_) {
          return arguments.length ? (sy = _ ? -1 : 1, recenter()) : sy < 0;
        };
        projection2.precision = function(_) {
          return arguments.length ? (projectResample = resample(projectTransform, delta2 = _ * _), reset()) : sqrt(delta2);
        };
        projection2.fitExtent = function(extent2, object3) {
          return fitExtent(projection2, extent2, object3);
        };
        projection2.fitSize = function(size, object3) {
          return fitSize(projection2, size, object3);
        };
        projection2.fitWidth = function(width, object3) {
          return fitWidth(projection2, width, object3);
        };
        projection2.fitHeight = function(height, object3) {
          return fitHeight(projection2, height, object3);
        };
        function recenter() {
          var center = scaleTranslateRotate(k, 0, 0, sx, sy, alpha).apply(null, project(lambda, phi)), transform2 = scaleTranslateRotate(k, x - center[0], y - center[1], sx, sy, alpha);
          rotate = rotateRadians(deltaLambda, deltaPhi, deltaGamma);
          projectTransform = compose(project, transform2);
          projectRotateTransform = compose(rotate, projectTransform);
          projectResample = resample(projectTransform, delta2);
          return reset();
        }
        function reset() {
          cache = cacheStream = null;
          return projection2;
        }
        return function() {
          project = projectAt.apply(this, arguments);
          projection2.invert = project.invert && invert;
          return recenter();
        };
      }
      function conicProjection(projectAt) {
        var phi02 = 0, phi12 = pi / 3, m = projectionMutator(projectAt), p = m(phi02, phi12);
        p.parallels = function(_) {
          return arguments.length ? m(phi02 = _[0] * radians, phi12 = _[1] * radians) : [phi02 * degrees, phi12 * degrees];
        };
        return p;
      }
      function cylindricalEqualAreaRaw(phi02) {
        var cosPhi02 = cos(phi02);
        function forward(lambda, phi) {
          return [lambda * cosPhi02, sin(phi) / cosPhi02];
        }
        forward.invert = function(x, y) {
          return [x / cosPhi02, asin(y * cosPhi02)];
        };
        return forward;
      }
      function conicEqualAreaRaw(y02, y12) {
        var sy0 = sin(y02), n = (sy0 + sin(y12)) / 2;
        if (abs(n) < epsilon) return cylindricalEqualAreaRaw(y02);
        var c = 1 + sy0 * (2 * n - sy0), r0 = sqrt(c) / n;
        function project(x, y) {
          var r = sqrt(c - 2 * n * sin(y)) / n;
          return [r * sin(x *= n), r0 - r * cos(x)];
        }
        project.invert = function(x, y) {
          var r0y = r0 - y, l = atan2(x, abs(r0y)) * sign(r0y);
          if (r0y * n < 0)
            l -= pi * sign(x) * sign(r0y);
          return [l / n, asin((c - (x * x + r0y * r0y) * n * n) / (2 * n))];
        };
        return project;
      }
      function conicEqualArea() {
        return conicProjection(conicEqualAreaRaw).scale(155.424).center([0, 33.6442]);
      }
      function albers() {
        return conicEqualArea().parallels([29.5, 45.5]).scale(1070).translate([480, 250]).rotate([96, 0]).center([-0.6, 38.7]);
      }
      function multiplex(streams) {
        var n = streams.length;
        return {
          point: function(x, y) {
            var i = -1;
            while (++i < n) streams[i].point(x, y);
          },
          sphere: function() {
            var i = -1;
            while (++i < n) streams[i].sphere();
          },
          lineStart: function() {
            var i = -1;
            while (++i < n) streams[i].lineStart();
          },
          lineEnd: function() {
            var i = -1;
            while (++i < n) streams[i].lineEnd();
          },
          polygonStart: function() {
            var i = -1;
            while (++i < n) streams[i].polygonStart();
          },
          polygonEnd: function() {
            var i = -1;
            while (++i < n) streams[i].polygonEnd();
          }
        };
      }
      function albersUsa() {
        var cache, cacheStream, lower48 = albers(), lower48Point, alaska = conicEqualArea().rotate([154, 0]).center([-2, 58.5]).parallels([55, 65]), alaskaPoint, hawaii = conicEqualArea().rotate([157, 0]).center([-3, 19.9]).parallels([8, 18]), hawaiiPoint, point, pointStream = { point: function(x, y) {
          point = [x, y];
        } };
        function albersUsa2(coordinates2) {
          var x = coordinates2[0], y = coordinates2[1];
          return point = null, (lower48Point.point(x, y), point) || (alaskaPoint.point(x, y), point) || (hawaiiPoint.point(x, y), point);
        }
        albersUsa2.invert = function(coordinates2) {
          var k = lower48.scale(), t = lower48.translate(), x = (coordinates2[0] - t[0]) / k, y = (coordinates2[1] - t[1]) / k;
          return (y >= 0.12 && y < 0.234 && x >= -0.425 && x < -0.214 ? alaska : y >= 0.166 && y < 0.234 && x >= -0.214 && x < -0.115 ? hawaii : lower48).invert(coordinates2);
        };
        albersUsa2.stream = function(stream) {
          return cache && cacheStream === stream ? cache : cache = multiplex([lower48.stream(cacheStream = stream), alaska.stream(stream), hawaii.stream(stream)]);
        };
        albersUsa2.precision = function(_) {
          if (!arguments.length) return lower48.precision();
          lower48.precision(_), alaska.precision(_), hawaii.precision(_);
          return reset();
        };
        albersUsa2.scale = function(_) {
          if (!arguments.length) return lower48.scale();
          lower48.scale(_), alaska.scale(_ * 0.35), hawaii.scale(_);
          return albersUsa2.translate(lower48.translate());
        };
        albersUsa2.translate = function(_) {
          if (!arguments.length) return lower48.translate();
          var k = lower48.scale(), x = +_[0], y = +_[1];
          lower48Point = lower48.translate(_).clipExtent([[x - 0.455 * k, y - 0.238 * k], [x + 0.455 * k, y + 0.238 * k]]).stream(pointStream);
          alaskaPoint = alaska.translate([x - 0.307 * k, y + 0.201 * k]).clipExtent([[x - 0.425 * k + epsilon, y + 0.12 * k + epsilon], [x - 0.214 * k - epsilon, y + 0.234 * k - epsilon]]).stream(pointStream);
          hawaiiPoint = hawaii.translate([x - 0.205 * k, y + 0.212 * k]).clipExtent([[x - 0.214 * k + epsilon, y + 0.166 * k + epsilon], [x - 0.115 * k - epsilon, y + 0.234 * k - epsilon]]).stream(pointStream);
          return reset();
        };
        albersUsa2.fitExtent = function(extent2, object3) {
          return fitExtent(albersUsa2, extent2, object3);
        };
        albersUsa2.fitSize = function(size, object3) {
          return fitSize(albersUsa2, size, object3);
        };
        albersUsa2.fitWidth = function(width, object3) {
          return fitWidth(albersUsa2, width, object3);
        };
        albersUsa2.fitHeight = function(height, object3) {
          return fitHeight(albersUsa2, height, object3);
        };
        function reset() {
          cache = cacheStream = null;
          return albersUsa2;
        }
        return albersUsa2.scale(1070);
      }
      function azimuthalRaw(scale) {
        return function(x, y) {
          var cx = cos(x), cy = cos(y), k = scale(cx * cy);
          if (k === Infinity) return [2, 0];
          return [
            k * cy * sin(x),
            k * sin(y)
          ];
        };
      }
      function azimuthalInvert(angle2) {
        return function(x, y) {
          var z = sqrt(x * x + y * y), c = angle2(z), sc = sin(c), cc = cos(c);
          return [
            atan2(x * sc, z * cc),
            asin(z && y * sc / z)
          ];
        };
      }
      var azimuthalEqualAreaRaw = azimuthalRaw(function(cxcy) {
        return sqrt(2 / (1 + cxcy));
      });
      azimuthalEqualAreaRaw.invert = azimuthalInvert(function(z) {
        return 2 * asin(z / 2);
      });
      function azimuthalEqualArea() {
        return projection(azimuthalEqualAreaRaw).scale(124.75).clipAngle(180 - 1e-3);
      }
      var azimuthalEquidistantRaw = azimuthalRaw(function(c) {
        return (c = acos(c)) && c / sin(c);
      });
      azimuthalEquidistantRaw.invert = azimuthalInvert(function(z) {
        return z;
      });
      function azimuthalEquidistant() {
        return projection(azimuthalEquidistantRaw).scale(79.4188).clipAngle(180 - 1e-3);
      }
      function mercatorRaw(lambda, phi) {
        return [lambda, log(tan((halfPi + phi) / 2))];
      }
      mercatorRaw.invert = function(x, y) {
        return [x, 2 * atan(exp(y)) - halfPi];
      };
      function mercator() {
        return mercatorProjection(mercatorRaw).scale(961 / tau);
      }
      function mercatorProjection(project) {
        var m = projection(project), center = m.center, scale = m.scale, translate = m.translate, clipExtent = m.clipExtent, x02 = null, y02, x12, y12;
        m.scale = function(_) {
          return arguments.length ? (scale(_), reclip()) : scale();
        };
        m.translate = function(_) {
          return arguments.length ? (translate(_), reclip()) : translate();
        };
        m.center = function(_) {
          return arguments.length ? (center(_), reclip()) : center();
        };
        m.clipExtent = function(_) {
          return arguments.length ? (_ == null ? x02 = y02 = x12 = y12 = null : (x02 = +_[0][0], y02 = +_[0][1], x12 = +_[1][0], y12 = +_[1][1]), reclip()) : x02 == null ? null : [[x02, y02], [x12, y12]];
        };
        function reclip() {
          var k = pi * scale(), t = m(rotation(m.rotate()).invert([0, 0]));
          return clipExtent(x02 == null ? [[t[0] - k, t[1] - k], [t[0] + k, t[1] + k]] : project === mercatorRaw ? [[Math.max(t[0] - k, x02), y02], [Math.min(t[0] + k, x12), y12]] : [[x02, Math.max(t[1] - k, y02)], [x12, Math.min(t[1] + k, y12)]]);
        }
        return reclip();
      }
      function tany(y) {
        return tan((halfPi + y) / 2);
      }
      function conicConformalRaw(y02, y12) {
        var cy0 = cos(y02), n = y02 === y12 ? sin(y02) : log(cy0 / cos(y12)) / log(tany(y12) / tany(y02)), f = cy0 * pow(tany(y02), n) / n;
        if (!n) return mercatorRaw;
        function project(x, y) {
          if (f > 0) {
            if (y < -halfPi + epsilon) y = -halfPi + epsilon;
          } else {
            if (y > halfPi - epsilon) y = halfPi - epsilon;
          }
          var r = f / pow(tany(y), n);
          return [r * sin(n * x), f - r * cos(n * x)];
        }
        project.invert = function(x, y) {
          var fy = f - y, r = sign(n) * sqrt(x * x + fy * fy), l = atan2(x, abs(fy)) * sign(fy);
          if (fy * n < 0)
            l -= pi * sign(x) * sign(fy);
          return [l / n, 2 * atan(pow(f / r, 1 / n)) - halfPi];
        };
        return project;
      }
      function conicConformal() {
        return conicProjection(conicConformalRaw).scale(109.5).parallels([30, 30]);
      }
      function equirectangularRaw(lambda, phi) {
        return [lambda, phi];
      }
      equirectangularRaw.invert = equirectangularRaw;
      function equirectangular() {
        return projection(equirectangularRaw).scale(152.63);
      }
      function conicEquidistantRaw(y02, y12) {
        var cy0 = cos(y02), n = y02 === y12 ? sin(y02) : (cy0 - cos(y12)) / (y12 - y02), g = cy0 / n + y02;
        if (abs(n) < epsilon) return equirectangularRaw;
        function project(x, y) {
          var gy = g - y, nx = n * x;
          return [gy * sin(nx), g - gy * cos(nx)];
        }
        project.invert = function(x, y) {
          var gy = g - y, l = atan2(x, abs(gy)) * sign(gy);
          if (gy * n < 0)
            l -= pi * sign(x) * sign(gy);
          return [l / n, g - sign(n) * sqrt(x * x + gy * gy)];
        };
        return project;
      }
      function conicEquidistant() {
        return conicProjection(conicEquidistantRaw).scale(131.154).center([0, 13.9389]);
      }
      var A1 = 1.340264, A2 = -0.081106, A3 = 893e-6, A4 = 3796e-6, M = sqrt(3) / 2, iterations = 12;
      function equalEarthRaw(lambda, phi) {
        var l = asin(M * sin(phi)), l2 = l * l, l6 = l2 * l2 * l2;
        return [
          lambda * cos(l) / (M * (A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2))),
          l * (A1 + A2 * l2 + l6 * (A3 + A4 * l2))
        ];
      }
      equalEarthRaw.invert = function(x, y) {
        var l = y, l2 = l * l, l6 = l2 * l2 * l2;
        for (var i = 0, delta, fy, fpy; i < iterations; ++i) {
          fy = l * (A1 + A2 * l2 + l6 * (A3 + A4 * l2)) - y;
          fpy = A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2);
          l -= delta = fy / fpy, l2 = l * l, l6 = l2 * l2 * l2;
          if (abs(delta) < epsilon2) break;
        }
        return [
          M * x * (A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2)) / cos(l),
          asin(sin(l) / M)
        ];
      };
      function equalEarth() {
        return projection(equalEarthRaw).scale(177.158);
      }
      function gnomonicRaw(x, y) {
        var cy = cos(y), k = cos(x) * cy;
        return [cy * sin(x) / k, sin(y) / k];
      }
      gnomonicRaw.invert = azimuthalInvert(atan);
      function gnomonic() {
        return projection(gnomonicRaw).scale(144.049).clipAngle(60);
      }
      function identity$1() {
        var k = 1, tx = 0, ty = 0, sx = 1, sy = 1, alpha = 0, ca, sa, x02 = null, y02, x12, y12, kx = 1, ky = 1, transform2 = transformer({
          point: function(x, y) {
            var p = projection2([x, y]);
            this.stream.point(p[0], p[1]);
          }
        }), postclip = identity, cache, cacheStream;
        function reset() {
          kx = k * sx;
          ky = k * sy;
          cache = cacheStream = null;
          return projection2;
        }
        function projection2(p) {
          var x = p[0] * kx, y = p[1] * ky;
          if (alpha) {
            var t = y * ca - x * sa;
            x = x * ca + y * sa;
            y = t;
          }
          return [x + tx, y + ty];
        }
        projection2.invert = function(p) {
          var x = p[0] - tx, y = p[1] - ty;
          if (alpha) {
            var t = y * ca + x * sa;
            x = x * ca - y * sa;
            y = t;
          }
          return [x / kx, y / ky];
        };
        projection2.stream = function(stream) {
          return cache && cacheStream === stream ? cache : cache = transform2(postclip(cacheStream = stream));
        };
        projection2.postclip = function(_) {
          return arguments.length ? (postclip = _, x02 = y02 = x12 = y12 = null, reset()) : postclip;
        };
        projection2.clipExtent = function(_) {
          return arguments.length ? (postclip = _ == null ? (x02 = y02 = x12 = y12 = null, identity) : clipRectangle(x02 = +_[0][0], y02 = +_[0][1], x12 = +_[1][0], y12 = +_[1][1]), reset()) : x02 == null ? null : [[x02, y02], [x12, y12]];
        };
        projection2.scale = function(_) {
          return arguments.length ? (k = +_, reset()) : k;
        };
        projection2.translate = function(_) {
          return arguments.length ? (tx = +_[0], ty = +_[1], reset()) : [tx, ty];
        };
        projection2.angle = function(_) {
          return arguments.length ? (alpha = _ % 360 * radians, sa = sin(alpha), ca = cos(alpha), reset()) : alpha * degrees;
        };
        projection2.reflectX = function(_) {
          return arguments.length ? (sx = _ ? -1 : 1, reset()) : sx < 0;
        };
        projection2.reflectY = function(_) {
          return arguments.length ? (sy = _ ? -1 : 1, reset()) : sy < 0;
        };
        projection2.fitExtent = function(extent2, object3) {
          return fitExtent(projection2, extent2, object3);
        };
        projection2.fitSize = function(size, object3) {
          return fitSize(projection2, size, object3);
        };
        projection2.fitWidth = function(width, object3) {
          return fitWidth(projection2, width, object3);
        };
        projection2.fitHeight = function(height, object3) {
          return fitHeight(projection2, height, object3);
        };
        return projection2;
      }
      function naturalEarth1Raw(lambda, phi) {
        var phi2 = phi * phi, phi4 = phi2 * phi2;
        return [
          lambda * (0.8707 - 0.131979 * phi2 + phi4 * (-0.013791 + phi4 * (3971e-6 * phi2 - 1529e-6 * phi4))),
          phi * (1.007226 + phi2 * (0.015085 + phi4 * (-0.044475 + 0.028874 * phi2 - 5916e-6 * phi4)))
        ];
      }
      naturalEarth1Raw.invert = function(x, y) {
        var phi = y, i = 25, delta;
        do {
          var phi2 = phi * phi, phi4 = phi2 * phi2;
          phi -= delta = (phi * (1.007226 + phi2 * (0.015085 + phi4 * (-0.044475 + 0.028874 * phi2 - 5916e-6 * phi4))) - y) / (1.007226 + phi2 * (0.015085 * 3 + phi4 * (-0.044475 * 7 + 0.028874 * 9 * phi2 - 5916e-6 * 11 * phi4)));
        } while (abs(delta) > epsilon && --i > 0);
        return [
          x / (0.8707 + (phi2 = phi * phi) * (-0.131979 + phi2 * (-0.013791 + phi2 * phi2 * phi2 * (3971e-6 - 1529e-6 * phi2)))),
          phi
        ];
      };
      function naturalEarth1() {
        return projection(naturalEarth1Raw).scale(175.295);
      }
      function orthographicRaw(x, y) {
        return [cos(y) * sin(x), sin(y)];
      }
      orthographicRaw.invert = azimuthalInvert(asin);
      function orthographic() {
        return projection(orthographicRaw).scale(249.5).clipAngle(90 + epsilon);
      }
      function stereographicRaw(x, y) {
        var cy = cos(y), k = 1 + cos(x) * cy;
        return [cy * sin(x) / k, sin(y) / k];
      }
      stereographicRaw.invert = azimuthalInvert(function(z) {
        return 2 * atan(z);
      });
      function stereographic() {
        return projection(stereographicRaw).scale(250).clipAngle(142);
      }
      function transverseMercatorRaw(lambda, phi) {
        return [log(tan((halfPi + phi) / 2)), -lambda];
      }
      transverseMercatorRaw.invert = function(x, y) {
        return [-y, 2 * atan(exp(x)) - halfPi];
      };
      function transverseMercator() {
        var m = mercatorProjection(transverseMercatorRaw), center = m.center, rotate = m.rotate;
        m.center = function(_) {
          return arguments.length ? center([-_[1], _[0]]) : (_ = center(), [_[1], -_[0]]);
        };
        m.rotate = function(_) {
          return arguments.length ? rotate([_[0], _[1], _.length > 2 ? _[2] + 90 : 90]) : (_ = rotate(), [_[0], _[1], _[2] - 90]);
        };
        return rotate([0, 0, 90]).scale(159.155);
      }
      exports2.geoAlbers = albers;
      exports2.geoAlbersUsa = albersUsa;
      exports2.geoArea = area;
      exports2.geoAzimuthalEqualArea = azimuthalEqualArea;
      exports2.geoAzimuthalEqualAreaRaw = azimuthalEqualAreaRaw;
      exports2.geoAzimuthalEquidistant = azimuthalEquidistant;
      exports2.geoAzimuthalEquidistantRaw = azimuthalEquidistantRaw;
      exports2.geoBounds = bounds;
      exports2.geoCentroid = centroid;
      exports2.geoCircle = circle;
      exports2.geoClipAntimeridian = clipAntimeridian;
      exports2.geoClipCircle = clipCircle;
      exports2.geoClipExtent = extent;
      exports2.geoClipRectangle = clipRectangle;
      exports2.geoConicConformal = conicConformal;
      exports2.geoConicConformalRaw = conicConformalRaw;
      exports2.geoConicEqualArea = conicEqualArea;
      exports2.geoConicEqualAreaRaw = conicEqualAreaRaw;
      exports2.geoConicEquidistant = conicEquidistant;
      exports2.geoConicEquidistantRaw = conicEquidistantRaw;
      exports2.geoContains = contains;
      exports2.geoDistance = distance;
      exports2.geoEqualEarth = equalEarth;
      exports2.geoEqualEarthRaw = equalEarthRaw;
      exports2.geoEquirectangular = equirectangular;
      exports2.geoEquirectangularRaw = equirectangularRaw;
      exports2.geoGnomonic = gnomonic;
      exports2.geoGnomonicRaw = gnomonicRaw;
      exports2.geoGraticule = graticule;
      exports2.geoGraticule10 = graticule10;
      exports2.geoIdentity = identity$1;
      exports2.geoInterpolate = interpolate;
      exports2.geoLength = length;
      exports2.geoMercator = mercator;
      exports2.geoMercatorRaw = mercatorRaw;
      exports2.geoNaturalEarth1 = naturalEarth1;
      exports2.geoNaturalEarth1Raw = naturalEarth1Raw;
      exports2.geoOrthographic = orthographic;
      exports2.geoOrthographicRaw = orthographicRaw;
      exports2.geoPath = index;
      exports2.geoProjection = projection;
      exports2.geoProjectionMutator = projectionMutator;
      exports2.geoRotation = rotation;
      exports2.geoStereographic = stereographic;
      exports2.geoStereographicRaw = stereographicRaw;
      exports2.geoStream = geoStream;
      exports2.geoTransform = transform;
      exports2.geoTransverseMercator = transverseMercator;
      exports2.geoTransverseMercatorRaw = transverseMercatorRaw;
      Object.defineProperty(exports2, "__esModule", { value: true });
    });
  }
});

// node_modules/geo-albers-usa-territories/dist/geo-albers-usa-territories.js
var require_geo_albers_usa_territories = __commonJS({
  "node_modules/geo-albers-usa-territories/dist/geo-albers-usa-territories.js"(exports, module) {
    (function(global, factory) {
      typeof exports === "object" && typeof module !== "undefined" ? factory(exports, require_d3_geo()) : typeof define === "function" && define.amd ? define(["exports", "d3-geo"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.geoAlbersUsaTerritories = {}, global.d3));
    })(exports, (function(exports2, d3Geo) {
      "use strict";
      var epsilon = 1e-6;
      function multiplex(streams) {
        return {
          point(x, y) {
            for (const s of streams) s.point(x, y);
          },
          sphere() {
            for (const s of streams) s.sphere();
          },
          lineStart() {
            for (const s of streams) s.lineStart();
          },
          lineEnd() {
            for (const s of streams) s.lineEnd();
          },
          polygonStart() {
            for (const s of streams) s.polygonStart();
          },
          polygonEnd() {
            for (const s of streams) s.polygonEnd();
          }
        };
      }
      function geoAlbersUsaTerritories2() {
        var cache, cacheStream, lower48 = d3Geo.geoAlbers(), lower48Point, alaska = d3Geo.geoConicEqualArea().rotate([154, 0]).center([-2, 58.5]).parallels([55, 65]), alaskaPoint, hawaii = d3Geo.geoConicEqualArea().rotate([157, 0]).center([-3, 19.9]).parallels([8, 18]), hawaiiPoint, puertoRico = d3Geo.geoConicEqualArea().rotate([66, 0]).center([0, 18]).parallels([8, 18]), puertoRicoPoint, guamMariana = d3Geo.geoConicEqualArea().rotate([-145, 0]).center([0, 16]).parallels([10, 20]), guamMarianaPoint, americanSamoa = d3Geo.geoConicEqualArea().rotate([170, 0]).center([0, -14]).parallels([-14, 0]), americanSamoaPoint, point, pointStream = {
          point: function(x, y) {
            point = [x, y];
          }
        };
        function albersUsaTerritories(coordinates) {
          var x = coordinates[0], y = coordinates[1];
          return point = null, (lower48Point.point(x, y), point) || (alaskaPoint.point(x, y), point) || (hawaiiPoint.point(x, y), point) || (puertoRicoPoint.point(x, y), point) || (guamMarianaPoint.point(x, y), point) || (americanSamoaPoint.point(x, y), point);
        }
        albersUsaTerritories.invert = function(coordinates) {
          var k = lower48.scale(), t = lower48.translate(), x = (coordinates[0] - t[0]) / k, y = (coordinates[1] - t[1]) / k;
          return (y >= 0.12 && y < 0.234 && x >= -0.225 && x < -0.185 ? alaska : y >= 0.166 && y < 0.234 && x >= -0.185 && x < -0.08 ? hawaii : y >= 0.204 && y < 0.234 && x >= 0.3 && x < 0.38 ? puertoRico : y >= 0.05 && y < 0.204 && x >= -0.415 && x < -0.225 ? guamMariana : y >= 0.18 && y < 0.234 && x >= -0.415 && x < -0.225 ? americanSamoa : lower48).invert(coordinates);
        };
        albersUsaTerritories.stream = function(stream) {
          return cache && cacheStream === stream ? cache : cache = multiplex([
            lower48.stream(cacheStream = stream),
            alaska.stream(stream),
            hawaii.stream(stream),
            puertoRico.stream(stream),
            guamMariana.stream(stream),
            americanSamoa.stream(stream)
          ]);
        };
        albersUsaTerritories.precision = function(_) {
          if (!arguments.length) return lower48.precision();
          lower48.precision(_);
          alaska.precision(_);
          hawaii.precision(_);
          puertoRico.precision(_);
          guamMariana.precision(_);
          americanSamoa.precision(_);
          return reset();
        };
        albersUsaTerritories.scale = function(_) {
          if (!arguments.length) return lower48.scale();
          lower48.scale(_);
          alaska.scale(_ * 0.35);
          hawaii.scale(_);
          puertoRico.scale(_);
          guamMariana.scale(_);
          americanSamoa.scale(_);
          return albersUsaTerritories.translate(lower48.translate());
        };
        albersUsaTerritories.translate = function(_) {
          if (!arguments.length) return lower48.translate();
          var k = lower48.scale(), x = +_[0], y = +_[1];
          lower48Point = lower48.translate(_).clipExtent([
            [x - 0.455 * k, y - 0.238 * k],
            [x + 0.455 * k, y + 0.238 * k]
          ]).stream(pointStream);
          alaskaPoint = alaska.translate([x - 0.275 * k, y + 0.201 * k]).clipExtent([
            [x - 0.425 * k + epsilon, y + 0.12 * k + epsilon],
            [x - 0.185 * k - epsilon, y + 0.234 * k - epsilon]
          ]).stream(pointStream);
          hawaiiPoint = hawaii.translate([x - 0.18 * k, y + 0.212 * k]).clipExtent([
            [x - 0.185 * k + epsilon, y + 0.166 * k + epsilon],
            [x - 0.08 * k - epsilon, y + 0.234 * k - epsilon]
          ]).stream(pointStream);
          puertoRicoPoint = puertoRico.translate([x + 0.335 * k, y + 0.224 * k]).clipExtent([
            [x + 0.3 * k, y + 0.204 * k],
            [x + 0.38 * k, y + 0.234 * k]
          ]).stream(pointStream);
          guamMarianaPoint = guamMariana.translate([x - 0.415 * k, y + 0.14 * k]).clipExtent([
            [x - 0.45 * k, y + 0.05 * k],
            [x - 0.39 * k, y + 0.21 * k]
          ]).stream(pointStream);
          americanSamoaPoint = americanSamoa.translate([x - 0.415 * k, y + 0.215 * k]).clipExtent([
            [x - 0.45 * k, y + 0.21 * k],
            [x - 0.39 * k, y + 0.234 * k]
          ]).stream(pointStream);
          return reset();
        };
        function reset() {
          cache = cacheStream = null;
          return albersUsaTerritories;
        }
        return albersUsaTerritories.scale(1070);
      }
      exports2.geoAlbersUsaTerritories = geoAlbersUsaTerritories2;
      Object.defineProperty(exports2, "__esModule", { value: true });
    }));
  }
});

// node_modules/d3-selection/src/namespaces.js
var xhtml = "http://www.w3.org/1999/xhtml";
var namespaces_default = {
  svg: "http://www.w3.org/2000/svg",
  xhtml,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};

// node_modules/d3-selection/src/namespace.js
function namespace_default(name) {
  var prefix = name += "", i = prefix.indexOf(":");
  if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
  return namespaces_default.hasOwnProperty(prefix) ? { space: namespaces_default[prefix], local: name } : name;
}

// node_modules/d3-selection/src/creator.js
function creatorInherit(name) {
  return function() {
    var document2 = this.ownerDocument, uri = this.namespaceURI;
    return uri === xhtml && document2.documentElement.namespaceURI === xhtml ? document2.createElement(name) : document2.createElementNS(uri, name);
  };
}
function creatorFixed(fullname) {
  return function() {
    return this.ownerDocument.createElementNS(fullname.space, fullname.local);
  };
}
function creator_default(name) {
  var fullname = namespace_default(name);
  return (fullname.local ? creatorFixed : creatorInherit)(fullname);
}

// node_modules/d3-selection/src/selector.js
function none() {
}
function selector_default(selector) {
  return selector == null ? none : function() {
    return this.querySelector(selector);
  };
}

// node_modules/d3-selection/src/selection/select.js
function select_default(select) {
  if (typeof select !== "function") select = selector_default(select);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
        if ("__data__" in node) subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
      }
    }
  }
  return new Selection(subgroups, this._parents);
}

// node_modules/d3-selection/src/array.js
function array(x) {
  return x == null ? [] : Array.isArray(x) ? x : Array.from(x);
}

// node_modules/d3-selection/src/selectorAll.js
function empty() {
  return [];
}
function selectorAll_default(selector) {
  return selector == null ? empty : function() {
    return this.querySelectorAll(selector);
  };
}

// node_modules/d3-selection/src/selection/selectAll.js
function arrayAll(select) {
  return function() {
    return array(select.apply(this, arguments));
  };
}
function selectAll_default(select) {
  if (typeof select === "function") select = arrayAll(select);
  else select = selectorAll_default(select);
  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        subgroups.push(select.call(node, node.__data__, i, group));
        parents.push(node);
      }
    }
  }
  return new Selection(subgroups, parents);
}

// node_modules/d3-selection/src/matcher.js
function matcher_default(selector) {
  return function() {
    return this.matches(selector);
  };
}
function childMatcher(selector) {
  return function(node) {
    return node.matches(selector);
  };
}

// node_modules/d3-selection/src/selection/selectChild.js
var find = Array.prototype.find;
function childFind(match) {
  return function() {
    return find.call(this.children, match);
  };
}
function childFirst() {
  return this.firstElementChild;
}
function selectChild_default(match) {
  return this.select(match == null ? childFirst : childFind(typeof match === "function" ? match : childMatcher(match)));
}

// node_modules/d3-selection/src/selection/selectChildren.js
var filter = Array.prototype.filter;
function children() {
  return Array.from(this.children);
}
function childrenFilter(match) {
  return function() {
    return filter.call(this.children, match);
  };
}
function selectChildren_default(match) {
  return this.selectAll(match == null ? children : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
}

// node_modules/d3-selection/src/selection/filter.js
function filter_default(match) {
  if (typeof match !== "function") match = matcher_default(match);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }
  return new Selection(subgroups, this._parents);
}

// node_modules/d3-selection/src/selection/sparse.js
function sparse_default(update) {
  return new Array(update.length);
}

// node_modules/d3-selection/src/selection/enter.js
function enter_default() {
  return new Selection(this._enter || this._groups.map(sparse_default), this._parents);
}
function EnterNode(parent, datum2) {
  this.ownerDocument = parent.ownerDocument;
  this.namespaceURI = parent.namespaceURI;
  this._next = null;
  this._parent = parent;
  this.__data__ = datum2;
}
EnterNode.prototype = {
  constructor: EnterNode,
  appendChild: function(child) {
    return this._parent.insertBefore(child, this._next);
  },
  insertBefore: function(child, next) {
    return this._parent.insertBefore(child, next);
  },
  querySelector: function(selector) {
    return this._parent.querySelector(selector);
  },
  querySelectorAll: function(selector) {
    return this._parent.querySelectorAll(selector);
  }
};

// node_modules/d3-selection/src/constant.js
function constant_default(x) {
  return function() {
    return x;
  };
}

// node_modules/d3-selection/src/selection/data.js
function bindIndex(parent, group, enter, update, exit, data) {
  var i = 0, node, groupLength = group.length, dataLength = data.length;
  for (; i < dataLength; ++i) {
    if (node = group[i]) {
      node.__data__ = data[i];
      update[i] = node;
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }
  for (; i < groupLength; ++i) {
    if (node = group[i]) {
      exit[i] = node;
    }
  }
}
function bindKey(parent, group, enter, update, exit, data, key) {
  var i, node, nodeByKeyValue = /* @__PURE__ */ new Map(), groupLength = group.length, dataLength = data.length, keyValues = new Array(groupLength), keyValue;
  for (i = 0; i < groupLength; ++i) {
    if (node = group[i]) {
      keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";
      if (nodeByKeyValue.has(keyValue)) {
        exit[i] = node;
      } else {
        nodeByKeyValue.set(keyValue, node);
      }
    }
  }
  for (i = 0; i < dataLength; ++i) {
    keyValue = key.call(parent, data[i], i, data) + "";
    if (node = nodeByKeyValue.get(keyValue)) {
      update[i] = node;
      node.__data__ = data[i];
      nodeByKeyValue.delete(keyValue);
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }
  for (i = 0; i < groupLength; ++i) {
    if ((node = group[i]) && nodeByKeyValue.get(keyValues[i]) === node) {
      exit[i] = node;
    }
  }
}
function datum(node) {
  return node.__data__;
}
function data_default(value, key) {
  if (!arguments.length) return Array.from(this, datum);
  var bind = key ? bindKey : bindIndex, parents = this._parents, groups = this._groups;
  if (typeof value !== "function") value = constant_default(value);
  for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
    var parent = parents[j], group = groups[j], groupLength = group.length, data = arraylike(value.call(parent, parent && parent.__data__, j, parents)), dataLength = data.length, enterGroup = enter[j] = new Array(dataLength), updateGroup = update[j] = new Array(dataLength), exitGroup = exit[j] = new Array(groupLength);
    bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);
    for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
      if (previous = enterGroup[i0]) {
        if (i0 >= i1) i1 = i0 + 1;
        while (!(next = updateGroup[i1]) && ++i1 < dataLength) ;
        previous._next = next || null;
      }
    }
  }
  update = new Selection(update, parents);
  update._enter = enter;
  update._exit = exit;
  return update;
}
function arraylike(data) {
  return typeof data === "object" && "length" in data ? data : Array.from(data);
}

// node_modules/d3-selection/src/selection/exit.js
function exit_default() {
  return new Selection(this._exit || this._groups.map(sparse_default), this._parents);
}

// node_modules/d3-selection/src/selection/join.js
function join_default(onenter, onupdate, onexit) {
  var enter = this.enter(), update = this, exit = this.exit();
  if (typeof onenter === "function") {
    enter = onenter(enter);
    if (enter) enter = enter.selection();
  } else {
    enter = enter.append(onenter + "");
  }
  if (onupdate != null) {
    update = onupdate(update);
    if (update) update = update.selection();
  }
  if (onexit == null) exit.remove();
  else onexit(exit);
  return enter && update ? enter.merge(update).order() : update;
}

// node_modules/d3-selection/src/selection/merge.js
function merge_default(context) {
  var selection2 = context.selection ? context.selection() : context;
  for (var groups0 = this._groups, groups1 = selection2._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }
  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }
  return new Selection(merges, this._parents);
}

// node_modules/d3-selection/src/selection/order.js
function order_default() {
  for (var groups = this._groups, j = -1, m = groups.length; ++j < m; ) {
    for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0; ) {
      if (node = group[i]) {
        if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
        next = node;
      }
    }
  }
  return this;
}

// node_modules/d3-selection/src/selection/sort.js
function sort_default(compare) {
  if (!compare) compare = ascending;
  function compareNode(a, b) {
    return a && b ? compare(a.__data__, b.__data__) : !a - !b;
  }
  for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        sortgroup[i] = node;
      }
    }
    sortgroup.sort(compareNode);
  }
  return new Selection(sortgroups, this._parents).order();
}
function ascending(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

// node_modules/d3-selection/src/selection/call.js
function call_default() {
  var callback = arguments[0];
  arguments[0] = this;
  callback.apply(null, arguments);
  return this;
}

// node_modules/d3-selection/src/selection/nodes.js
function nodes_default() {
  return Array.from(this);
}

// node_modules/d3-selection/src/selection/node.js
function node_default() {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
      var node = group[i];
      if (node) return node;
    }
  }
  return null;
}

// node_modules/d3-selection/src/selection/size.js
function size_default() {
  let size = 0;
  for (const node of this) ++size;
  return size;
}

// node_modules/d3-selection/src/selection/empty.js
function empty_default() {
  return !this.node();
}

// node_modules/d3-selection/src/selection/each.js
function each_default(callback) {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i]) callback.call(node, node.__data__, i, group);
    }
  }
  return this;
}

// node_modules/d3-selection/src/selection/attr.js
function attrRemove(name) {
  return function() {
    this.removeAttribute(name);
  };
}
function attrRemoveNS(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}
function attrConstant(name, value) {
  return function() {
    this.setAttribute(name, value);
  };
}
function attrConstantNS(fullname, value) {
  return function() {
    this.setAttributeNS(fullname.space, fullname.local, value);
  };
}
function attrFunction(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.removeAttribute(name);
    else this.setAttribute(name, v);
  };
}
function attrFunctionNS(fullname, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
    else this.setAttributeNS(fullname.space, fullname.local, v);
  };
}
function attr_default(name, value) {
  var fullname = namespace_default(name);
  if (arguments.length < 2) {
    var node = this.node();
    return fullname.local ? node.getAttributeNS(fullname.space, fullname.local) : node.getAttribute(fullname);
  }
  return this.each((value == null ? fullname.local ? attrRemoveNS : attrRemove : typeof value === "function" ? fullname.local ? attrFunctionNS : attrFunction : fullname.local ? attrConstantNS : attrConstant)(fullname, value));
}

// node_modules/d3-selection/src/window.js
function window_default(node) {
  return node.ownerDocument && node.ownerDocument.defaultView || node.document && node || node.defaultView;
}

// node_modules/d3-selection/src/selection/style.js
function styleRemove(name) {
  return function() {
    this.style.removeProperty(name);
  };
}
function styleConstant(name, value, priority) {
  return function() {
    this.style.setProperty(name, value, priority);
  };
}
function styleFunction(name, value, priority) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.style.removeProperty(name);
    else this.style.setProperty(name, v, priority);
  };
}
function style_default(name, value, priority) {
  return arguments.length > 1 ? this.each((value == null ? styleRemove : typeof value === "function" ? styleFunction : styleConstant)(name, value, priority == null ? "" : priority)) : styleValue(this.node(), name);
}
function styleValue(node, name) {
  return node.style.getPropertyValue(name) || window_default(node).getComputedStyle(node, null).getPropertyValue(name);
}

// node_modules/d3-selection/src/selection/property.js
function propertyRemove(name) {
  return function() {
    delete this[name];
  };
}
function propertyConstant(name, value) {
  return function() {
    this[name] = value;
  };
}
function propertyFunction(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) delete this[name];
    else this[name] = v;
  };
}
function property_default(name, value) {
  return arguments.length > 1 ? this.each((value == null ? propertyRemove : typeof value === "function" ? propertyFunction : propertyConstant)(name, value)) : this.node()[name];
}

// node_modules/d3-selection/src/selection/classed.js
function classArray(string) {
  return string.trim().split(/^|\s+/);
}
function classList(node) {
  return node.classList || new ClassList(node);
}
function ClassList(node) {
  this._node = node;
  this._names = classArray(node.getAttribute("class") || "");
}
ClassList.prototype = {
  add: function(name) {
    var i = this._names.indexOf(name);
    if (i < 0) {
      this._names.push(name);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  remove: function(name) {
    var i = this._names.indexOf(name);
    if (i >= 0) {
      this._names.splice(i, 1);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  contains: function(name) {
    return this._names.indexOf(name) >= 0;
  }
};
function classedAdd(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n) list.add(names[i]);
}
function classedRemove(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n) list.remove(names[i]);
}
function classedTrue(names) {
  return function() {
    classedAdd(this, names);
  };
}
function classedFalse(names) {
  return function() {
    classedRemove(this, names);
  };
}
function classedFunction(names, value) {
  return function() {
    (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
  };
}
function classed_default(name, value) {
  var names = classArray(name + "");
  if (arguments.length < 2) {
    var list = classList(this.node()), i = -1, n = names.length;
    while (++i < n) if (!list.contains(names[i])) return false;
    return true;
  }
  return this.each((typeof value === "function" ? classedFunction : value ? classedTrue : classedFalse)(names, value));
}

// node_modules/d3-selection/src/selection/text.js
function textRemove() {
  this.textContent = "";
}
function textConstant(value) {
  return function() {
    this.textContent = value;
  };
}
function textFunction(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.textContent = v == null ? "" : v;
  };
}
function text_default(value) {
  return arguments.length ? this.each(value == null ? textRemove : (typeof value === "function" ? textFunction : textConstant)(value)) : this.node().textContent;
}

// node_modules/d3-selection/src/selection/html.js
function htmlRemove() {
  this.innerHTML = "";
}
function htmlConstant(value) {
  return function() {
    this.innerHTML = value;
  };
}
function htmlFunction(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.innerHTML = v == null ? "" : v;
  };
}
function html_default(value) {
  return arguments.length ? this.each(value == null ? htmlRemove : (typeof value === "function" ? htmlFunction : htmlConstant)(value)) : this.node().innerHTML;
}

// node_modules/d3-selection/src/selection/raise.js
function raise() {
  if (this.nextSibling) this.parentNode.appendChild(this);
}
function raise_default() {
  return this.each(raise);
}

// node_modules/d3-selection/src/selection/lower.js
function lower() {
  if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function lower_default() {
  return this.each(lower);
}

// node_modules/d3-selection/src/selection/append.js
function append_default(name) {
  var create = typeof name === "function" ? name : creator_default(name);
  return this.select(function() {
    return this.appendChild(create.apply(this, arguments));
  });
}

// node_modules/d3-selection/src/selection/insert.js
function constantNull() {
  return null;
}
function insert_default(name, before) {
  var create = typeof name === "function" ? name : creator_default(name), select = before == null ? constantNull : typeof before === "function" ? before : selector_default(before);
  return this.select(function() {
    return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
  });
}

// node_modules/d3-selection/src/selection/remove.js
function remove() {
  var parent = this.parentNode;
  if (parent) parent.removeChild(this);
}
function remove_default() {
  return this.each(remove);
}

// node_modules/d3-selection/src/selection/clone.js
function selection_cloneShallow() {
  var clone = this.cloneNode(false), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}
function selection_cloneDeep() {
  var clone = this.cloneNode(true), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}
function clone_default(deep) {
  return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
}

// node_modules/d3-selection/src/selection/datum.js
function datum_default(value) {
  return arguments.length ? this.property("__data__", value) : this.node().__data__;
}

// node_modules/d3-selection/src/selection/on.js
function contextListener(listener) {
  return function(event) {
    listener.call(this, event, this.__data__);
  };
}
function parseTypenames(typenames) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    return { type: t, name };
  });
}
function onRemove(typename) {
  return function() {
    var on = this.__on;
    if (!on) return;
    for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
      if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.options);
      } else {
        on[++i] = o;
      }
    }
    if (++i) on.length = i;
    else delete this.__on;
  };
}
function onAdd(typename, value, options) {
  return function() {
    var on = this.__on, o, listener = contextListener(value);
    if (on) for (var j = 0, m = on.length; j < m; ++j) {
      if ((o = on[j]).type === typename.type && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.options);
        this.addEventListener(o.type, o.listener = listener, o.options = options);
        o.value = value;
        return;
      }
    }
    this.addEventListener(typename.type, listener, options);
    o = { type: typename.type, name: typename.name, value, listener, options };
    if (!on) this.__on = [o];
    else on.push(o);
  };
}
function on_default(typename, value, options) {
  var typenames = parseTypenames(typename + ""), i, n = typenames.length, t;
  if (arguments.length < 2) {
    var on = this.node().__on;
    if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
      for (i = 0, o = on[j]; i < n; ++i) {
        if ((t = typenames[i]).type === o.type && t.name === o.name) {
          return o.value;
        }
      }
    }
    return;
  }
  on = value ? onAdd : onRemove;
  for (i = 0; i < n; ++i) this.each(on(typenames[i], value, options));
  return this;
}

// node_modules/d3-selection/src/selection/dispatch.js
function dispatchEvent(node, type, params) {
  var window2 = window_default(node), event = window2.CustomEvent;
  if (typeof event === "function") {
    event = new event(type, params);
  } else {
    event = window2.document.createEvent("Event");
    if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
    else event.initEvent(type, false, false);
  }
  node.dispatchEvent(event);
}
function dispatchConstant(type, params) {
  return function() {
    return dispatchEvent(this, type, params);
  };
}
function dispatchFunction(type, params) {
  return function() {
    return dispatchEvent(this, type, params.apply(this, arguments));
  };
}
function dispatch_default(type, params) {
  return this.each((typeof params === "function" ? dispatchFunction : dispatchConstant)(type, params));
}

// node_modules/d3-selection/src/selection/iterator.js
function* iterator_default() {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i]) yield node;
    }
  }
}

// node_modules/d3-selection/src/selection/index.js
var root = [null];
function Selection(groups, parents) {
  this._groups = groups;
  this._parents = parents;
}
function selection() {
  return new Selection([[document.documentElement]], root);
}
function selection_selection() {
  return this;
}
Selection.prototype = selection.prototype = {
  constructor: Selection,
  select: select_default,
  selectAll: selectAll_default,
  selectChild: selectChild_default,
  selectChildren: selectChildren_default,
  filter: filter_default,
  data: data_default,
  enter: enter_default,
  exit: exit_default,
  join: join_default,
  merge: merge_default,
  selection: selection_selection,
  order: order_default,
  sort: sort_default,
  call: call_default,
  nodes: nodes_default,
  node: node_default,
  size: size_default,
  empty: empty_default,
  each: each_default,
  attr: attr_default,
  style: style_default,
  property: property_default,
  classed: classed_default,
  text: text_default,
  html: html_default,
  raise: raise_default,
  lower: lower_default,
  append: append_default,
  insert: insert_default,
  remove: remove_default,
  clone: clone_default,
  datum: datum_default,
  on: on_default,
  dispatch: dispatch_default,
  [Symbol.iterator]: iterator_default
};

// node_modules/d3-selection/src/select.js
function select_default2(selector) {
  return typeof selector === "string" ? new Selection([[document.querySelector(selector)]], [document.documentElement]) : new Selection([[selector]], root);
}

// src/nps-parks-card.js
var import_d3_geo = __toESM(require_d3_geo(), 1);

// node_modules/topojson-client/src/identity.js
function identity_default(x) {
  return x;
}

// node_modules/topojson-client/src/transform.js
function transform_default(transform) {
  if (transform == null) return identity_default;
  var x0, y0, kx = transform.scale[0], ky = transform.scale[1], dx = transform.translate[0], dy = transform.translate[1];
  return function(input, i) {
    if (!i) x0 = y0 = 0;
    var j = 2, n = input.length, output = new Array(n);
    output[0] = (x0 += input[0]) * kx + dx;
    output[1] = (y0 += input[1]) * ky + dy;
    while (j < n) output[j] = input[j], ++j;
    return output;
  };
}

// node_modules/topojson-client/src/reverse.js
function reverse_default(array2, n) {
  var t, j = array2.length, i = j - n;
  while (i < --j) t = array2[i], array2[i++] = array2[j], array2[j] = t;
}

// node_modules/topojson-client/src/feature.js
function feature_default(topology, o) {
  if (typeof o === "string") o = topology.objects[o];
  return o.type === "GeometryCollection" ? { type: "FeatureCollection", features: o.geometries.map(function(o2) {
    return feature(topology, o2);
  }) } : feature(topology, o);
}
function feature(topology, o) {
  var id = o.id, bbox = o.bbox, properties = o.properties == null ? {} : o.properties, geometry = object(topology, o);
  return id == null && bbox == null ? { type: "Feature", properties, geometry } : bbox == null ? { type: "Feature", id, properties, geometry } : { type: "Feature", id, bbox, properties, geometry };
}
function object(topology, o) {
  var transformPoint = transform_default(topology.transform), arcs = topology.arcs;
  function arc(i, points) {
    if (points.length) points.pop();
    for (var a = arcs[i < 0 ? ~i : i], k = 0, n = a.length; k < n; ++k) {
      points.push(transformPoint(a[k], k));
    }
    if (i < 0) reverse_default(points, n);
  }
  function point(p) {
    return transformPoint(p);
  }
  function line(arcs2) {
    var points = [];
    for (var i = 0, n = arcs2.length; i < n; ++i) arc(arcs2[i], points);
    if (points.length < 2) points.push(points[0]);
    return points;
  }
  function ring(arcs2) {
    var points = line(arcs2);
    while (points.length < 4) points.push(points[0]);
    return points;
  }
  function polygon(arcs2) {
    return arcs2.map(ring);
  }
  function geometry(o2) {
    var type = o2.type, coordinates;
    switch (type) {
      case "GeometryCollection":
        return { type, geometries: o2.geometries.map(geometry) };
      case "Point":
        coordinates = point(o2.coordinates);
        break;
      case "MultiPoint":
        coordinates = o2.coordinates.map(point);
        break;
      case "LineString":
        coordinates = line(o2.arcs);
        break;
      case "MultiLineString":
        coordinates = o2.arcs.map(line);
        break;
      case "Polygon":
        coordinates = polygon(o2.arcs);
        break;
      case "MultiPolygon":
        coordinates = o2.arcs.map(polygon);
        break;
      default:
        return null;
    }
    return { type, coordinates };
  }
  return geometry(o);
}

// node_modules/topojson-client/src/stitch.js
function stitch_default(topology, arcs) {
  var stitchedArcs = {}, fragmentByStart = {}, fragmentByEnd = {}, fragments = [], emptyIndex = -1;
  arcs.forEach(function(i, j) {
    var arc = topology.arcs[i < 0 ? ~i : i], t;
    if (arc.length < 3 && !arc[1][0] && !arc[1][1]) {
      t = arcs[++emptyIndex], arcs[emptyIndex] = i, arcs[j] = t;
    }
  });
  arcs.forEach(function(i) {
    var e = ends(i), start = e[0], end = e[1], f, g;
    if (f = fragmentByEnd[start]) {
      delete fragmentByEnd[f.end];
      f.push(i);
      f.end = end;
      if (g = fragmentByStart[end]) {
        delete fragmentByStart[g.start];
        var fg = g === f ? f : f.concat(g);
        fragmentByStart[fg.start = f.start] = fragmentByEnd[fg.end = g.end] = fg;
      } else {
        fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
      }
    } else if (f = fragmentByStart[end]) {
      delete fragmentByStart[f.start];
      f.unshift(i);
      f.start = start;
      if (g = fragmentByEnd[start]) {
        delete fragmentByEnd[g.end];
        var gf = g === f ? f : g.concat(f);
        fragmentByStart[gf.start = g.start] = fragmentByEnd[gf.end = f.end] = gf;
      } else {
        fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
      }
    } else {
      f = [i];
      fragmentByStart[f.start = start] = fragmentByEnd[f.end = end] = f;
    }
  });
  function ends(i) {
    var arc = topology.arcs[i < 0 ? ~i : i], p0 = arc[0], p1;
    if (topology.transform) p1 = [0, 0], arc.forEach(function(dp) {
      p1[0] += dp[0], p1[1] += dp[1];
    });
    else p1 = arc[arc.length - 1];
    return i < 0 ? [p1, p0] : [p0, p1];
  }
  function flush(fragmentByEnd2, fragmentByStart2) {
    for (var k in fragmentByEnd2) {
      var f = fragmentByEnd2[k];
      delete fragmentByStart2[f.start];
      delete f.start;
      delete f.end;
      f.forEach(function(i) {
        stitchedArcs[i < 0 ? ~i : i] = 1;
      });
      fragments.push(f);
    }
  }
  flush(fragmentByEnd, fragmentByStart);
  flush(fragmentByStart, fragmentByEnd);
  arcs.forEach(function(i) {
    if (!stitchedArcs[i < 0 ? ~i : i]) fragments.push([i]);
  });
  return fragments;
}

// node_modules/topojson-client/src/mesh.js
function mesh_default(topology) {
  return object(topology, meshArcs.apply(this, arguments));
}
function meshArcs(topology, object2, filter2) {
  var arcs, i, n;
  if (arguments.length > 1) arcs = extractArcs(topology, object2, filter2);
  else for (i = 0, arcs = new Array(n = topology.arcs.length); i < n; ++i) arcs[i] = i;
  return { type: "MultiLineString", arcs: stitch_default(topology, arcs) };
}
function extractArcs(topology, object2, filter2) {
  var arcs = [], geomsByArc = [], geom;
  function extract0(i) {
    var j = i < 0 ? ~i : i;
    (geomsByArc[j] || (geomsByArc[j] = [])).push({ i, g: geom });
  }
  function extract1(arcs2) {
    arcs2.forEach(extract0);
  }
  function extract2(arcs2) {
    arcs2.forEach(extract1);
  }
  function extract3(arcs2) {
    arcs2.forEach(extract2);
  }
  function geometry(o) {
    switch (geom = o, o.type) {
      case "GeometryCollection":
        o.geometries.forEach(geometry);
        break;
      case "LineString":
        extract1(o.arcs);
        break;
      case "MultiLineString":
      case "Polygon":
        extract2(o.arcs);
        break;
      case "MultiPolygon":
        extract3(o.arcs);
        break;
    }
  }
  geometry(object2);
  geomsByArc.forEach(filter2 == null ? function(geoms) {
    arcs.push(geoms[0].i);
  } : function(geoms) {
    if (filter2(geoms[0].g, geoms[geoms.length - 1].g)) arcs.push(geoms[0].i);
  });
  return arcs;
}

// src/nps-parks-card.js
var import_geo_albers_usa_territories = __toESM(require_geo_albers_usa_territories(), 1);
var US_ATLAS_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";
var SVG_W = 960;
var SVG_H = 600;
var PRESETS = {
  classic: {
    light: { background: "#c9d8e8", land: "#ede9dc", border: "#ffffff", coastline: "#c0b898" },
    dark: { background: "#0f172a", land: "#2c3440", border: "#161b22", coastline: "#4a5568" }
  },
  slate: {
    light: { background: "#d9e2ec", land: "#e4e7eb", border: "#ffffff", coastline: "#9fb3c8" },
    dark: { background: "#111827", land: "#1f2937", border: "#0b0f17", coastline: "#374151" }
  },
  sepia: {
    light: { background: "#e8dcc8", land: "#f1e6d3", border: "#ffffff", coastline: "#b39b72" },
    dark: { background: "#241c14", land: "#3a2f22", border: "#150f0a", coastline: "#5a4a35" }
  }
};
var DEFAULT_PRESET = "classic";
var FORM_SCHEMA = [
  {
    type: "grid",
    name: "theme_settings",
    schema: [
      {
        name: "theme_mode",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "auto", label: "Follow Home Assistant theme" },
              { value: "light", label: "Always light" },
              { value: "dark", label: "Always dark" }
            ]
          }
        }
      },
      {
        name: "color_preset",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "classic", label: "Classic" },
              { value: "slate", label: "Slate" },
              { value: "sepia", label: "Sepia" }
            ]
          }
        }
      }
    ]
  },
  {
    name: "show_background",
    selector: { boolean: {} }
  }
];
var MARKER_GROUPS = [
  {
    key: "visited",
    title: "Visited marker",
    colorKey: "visited_color",
    colorLabel: "Marker color",
    fields: [
      { name: "visited_icon", selector: { icon: {} } },
      { name: "visited_marker_size", selector: { number: { min: 4, max: 40, mode: "slider" } } },
      { name: "visited_opacity", selector: { number: { min: 0, max: 1, step: 0.05, mode: "slider" } } }
    ]
  },
  {
    key: "unvisited",
    title: "Unvisited marker",
    colorKey: "unvisited_color",
    colorLabel: "Marker color",
    fields: [
      { name: "unvisited_icon", selector: { icon: {} } },
      { name: "unvisited_marker_size", selector: { number: { min: 4, max: 40, mode: "slider" } } },
      { name: "unvisited_opacity", selector: { number: { min: 0, max: 1, step: 0.05, mode: "slider" } } }
    ]
  }
];
var COLOR_GROUPS = [
  {
    title: "Light theme colors",
    keys: [
      ["light_background_color", "Background"],
      ["light_land_color", "Land"],
      ["light_border_color", "State borders"],
      ["light_coastline_color", "Coastline"]
    ]
  },
  {
    title: "Dark theme colors",
    keys: [
      ["dark_background_color", "Background"],
      ["dark_land_color", "Land"],
      ["dark_border_color", "State borders"],
      ["dark_coastline_color", "Coastline"]
    ]
  }
];
var OPTION_SECTION = {};
(function indexSchema(schema, parent) {
  for (const item of schema) {
    if (item.schema) indexSchema(item.schema, item.name || parent);
    else OPTION_SECTION[item.name] = parent || null;
  }
})(FORM_SCHEMA, null);
var MAIN_FORM_KEYS = Object.keys(OPTION_SECTION);
for (const group of MARKER_GROUPS) {
  for (const field of group.fields) OPTION_SECTION[field.name] = null;
}
var SECTION_NAMES = [...new Set(Object.values(OPTION_SECTION).filter(Boolean))];
var LEGACY_SECTION_NAMES = ["light_theme_colors", "dark_theme_colors", "visited_marker", "unvisited_marker"];
var ALL_SECTION_NAMES = [...SECTION_NAMES, ...LEGACY_SECTION_NAMES];
function optionDefaults(flat) {
  const preset = PRESETS[flat.color_preset] || PRESETS[DEFAULT_PRESET];
  const legacySize = flat.marker_radius ? flat.marker_radius * 2 : flat.marker_size || 12;
  return {
    theme_mode: "auto",
    color_preset: DEFAULT_PRESET,
    show_background: true,
    light_background_color: preset.light.background,
    light_land_color: preset.light.land,
    light_border_color: preset.light.border,
    light_coastline_color: preset.light.coastline,
    dark_background_color: preset.dark.background,
    dark_land_color: preset.dark.land,
    dark_border_color: preset.dark.border,
    dark_coastline_color: preset.dark.coastline,
    visited_icon: null,
    visited_marker_size: legacySize,
    visited_opacity: 1,
    visited_color: "#2D6A4F",
    unvisited_icon: null,
    unvisited_marker_size: legacySize,
    unvisited_opacity: 0.75,
    unvisited_color: "#9a9a9a"
  };
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[ch]);
}
function optionEquals(a, b) {
  if (typeof a === "string" && typeof b === "string") {
    return a.toLowerCase() === b.toLowerCase();
  }
  return a === b;
}
function flattenConfig(config) {
  const flat = {};
  for (const [key, value] of Object.entries(config || {})) {
    if (ALL_SECTION_NAMES.includes(key) && value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(flat, value);
    } else {
      flat[key] = value;
    }
  }
  return flat;
}
var NPSParksCard = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._config = {};
    this._projection = null;
    this._markers = {};
    this._lastEntities = null;
    this._initialized = false;
    this._panelOpen = false;
    this._search = "";
  }
  static getStubConfig() {
    return {};
  }
  setConfig(config) {
    config = flattenConfig(config);
    const legacyRadius = config.marker_radius;
    const legacySize = config.marker_size;
    const defaultSize = legacyRadius ? legacyRadius * 2 : legacySize || 12;
    const preset = PRESETS[config.color_preset] || PRESETS[DEFAULT_PRESET];
    this._config = {
      visited_color: "#2D6A4F",
      unvisited_color: "#9a9a9a",
      visited_opacity: 1,
      unvisited_opacity: 0.75,
      visited_marker_size: defaultSize,
      unvisited_marker_size: defaultSize,
      visited_icon: null,
      // e.g. 'mdi:pine-tree' — null = plain dot
      unvisited_icon: null,
      // e.g. 'mdi:circle-outline' — null = plain dot
      // Which color set to render with. 'auto' follows Home
      // Assistant's own light/dark mode; 'light'/'dark' pin it.
      theme_mode: "auto",
      color_preset: DEFAULT_PRESET,
      // Map colors, seeded from the chosen preset and individually
      // overridable per theme.
      show_background: true,
      light_background_color: preset.light.background,
      light_land_color: preset.light.land,
      light_border_color: preset.light.border,
      light_coastline_color: preset.light.coastline,
      dark_background_color: preset.dark.background,
      dark_land_color: preset.dark.land,
      dark_border_color: preset.dark.border,
      dark_coastline_color: preset.dark.coastline,
      ...config
    };
    if (config.background_color && !config.light_background_color) {
      this._config.light_background_color = config.background_color;
    }
    if (this._initialized) this._applyConfig();
  }
  set hass(hass) {
    const wasDark = this._initialized && this._config.theme_mode === "auto" ? this._isDarkMode() : null;
    this._hass = hass;
    if (this._initialized && this._config.theme_mode === "auto" && this._isDarkMode() !== wasDark) {
      this._applyThemeColors();
    }
    if (this._initialized) this._updateMarkers();
  }
  connectedCallback() {
    if (!this._initialized) this._init();
  }
  disconnectedCallback() {
    this._projection = null;
    this._markers = {};
    this._lastEntities = null;
    this._initialized = false;
    this._panelOpen = false;
    this.shadowRoot.innerHTML = "";
  }
  async _init() {
    const topoData = await fetch(US_ATLAS_URL).then((r) => r.json());
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: relative;
          border-radius: var(--ha-card-border-radius, 12px);
          box-shadow: var(--nps-card-shadow, var(--ha-card-box-shadow, 0 2px 2px rgba(0,0,0,.14),0 1px 5px rgba(0,0,0,.12)));
          overflow: hidden;
          background: var(--nps-ocean-color, #c9d8e8);
          font-family: sans-serif;
        }
        #map-wrap {
          width: 100%;
          aspect-ratio: ${SVG_W} / ${SVG_H};
          position: relative;
          overflow: hidden;
        }
        #us-map {
          width: 100%;
          height: 100%;
          display: block;
        }
        .state {
          fill: #ede9dc;
          stroke: #fff;
          stroke-width: 0.6;
        }
        .nation-border {
          fill: none;
          stroke: #c0b898;
          stroke-width: 1.4;
        }
        .territory {
          fill: #ede9dc;
          stroke: #c0b898;
          stroke-width: 0.9;
        }
        .park-marker {
          cursor: pointer;
          stroke: #fff;
          stroke-width: 1.5;
          transition: r 0.1s ease;
        }
        /* Icon-mode markers: an HTML overlay positioned by percentage.
           Safe because #map-wrap's aspect-ratio matches the SVG viewBox
           exactly, so the SVG never letterboxes inside it. */
        #icon-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .icon-marker {
          position: absolute;
          pointer-events: auto;
          cursor: pointer;
          transform: translate(-50%, -50%);
          transition: transform 0.1s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 0 1px #fff) drop-shadow(0 0 1px #fff);
        }
        /* ha-icon's own internal shadow DOM doesn't center its rendered
           content (ha-svg-icon) within itself \u2014 confirmed via devtools:
           ha-svg-icon self-centers its glyph, but sits off-center inside
           ha-icon. We can't reach into ha-icon's shadow root to fix that
           directly, but external styles targeting a custom element's host
           (this rule) take precedence over its own internal :host rules,
           and a host's display value governs how its shadow-rendered
           content is laid out \u2014 so this centers ha-svg-icon inside ha-icon
           without needing to touch ha-icon's internals at all. */
        .icon-marker ha-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
        .icon-marker:hover { transform: translate(-50%, -50%) scale(1.18); }
        /* Popup */
        #popup {
          position: absolute;
          z-index: 1500;
          background: var(--card-background-color, #fff);
          color: var(--primary-text-color, #212121);
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,.28);
          width: 262px;
          max-height: calc(100% - 16px);
          display: none;
          overflow-x: hidden;
          overflow-y: auto;
        }
        #popup.visible { display: block; }
        .popup-img { width:100%; height:130px; object-fit:cover; display:block; }
        .popup-body { padding: 10px 12px 12px; }
        .popup-name { font-weight:600; font-size:14px; margin-bottom:2px; }
        .popup-meta { font-size:11px; color: var(--secondary-text-color, #888); margin-bottom:6px; }
        .popup-desc { font-size:12px; line-height:1.5; margin-bottom:6px; }
        .popup-link {
          font-size:12px; text-decoration:none; display:inline-block; margin-bottom:4px;
        }
        .popup-toggle {
          display:block; width:100%; margin-top:8px; padding:8px;
          border:none; border-radius:6px; color:#fff; font-size:13px;
          cursor:pointer; font-family:sans-serif;
        }
        .popup-close {
          position:absolute; top:6px; right:7px;
          background:rgba(0,0,0,.45); border:none; color:#fff;
          border-radius:50%; width:22px; height:22px; cursor:pointer;
          font-size:14px; line-height:1; display:flex;
          align-items:center; justify-content:center;
          font-family:sans-serif;
        }
        /* Panel-open button */
        #panel-btn {
          position:absolute; top:10px; right:10px; z-index:1000;
          width:34px; height:34px;
          background: var(--card-background-color, #fff);
          color: var(--primary-text-color, #333);
          border:1px solid var(--divider-color, #ccc);
          border-radius:6px; font-size:18px;
          cursor:pointer; display:flex; align-items:center; justify-content:center;
          box-shadow:0 1px 4px rgba(0,0,0,.2);
        }
        /* Slide-in panel */
        #panel {
          position:absolute; top:0; right:-310px; width:290px; height:100%;
          background: var(--card-background-color, #fff);
          color: var(--primary-text-color, #212121);
          z-index:2000; transition:right .25s ease;
          box-shadow:-2px 0 8px rgba(0,0,0,.15); display:flex;
          flex-direction:column;
        }
        #panel.open { right:0; }
        .panel-header {
          padding:12px 14px; border-bottom:1px solid var(--divider-color, #eee);
          display:flex; align-items:center; justify-content:space-between;
          flex-shrink:0;
        }
        .panel-header span { font-weight:500; font-size:15px; }
        .panel-close {
          background:none; border:none; font-size:22px; cursor:pointer;
          color: var(--secondary-text-color, #666);
        }
        .panel-search { padding:10px 14px; border-bottom:1px solid var(--divider-color, #eee); flex-shrink:0; }
        .panel-search input {
          width:100%; box-sizing:border-box; padding:8px 10px;
          background: var(--card-background-color, #fff);
          color: var(--primary-text-color, #212121);
          border:1px solid var(--divider-color, #ccc); border-radius:6px; font-size:14px;
        }
        #park-list { flex:1; overflow-y:auto; }
        .park-row {
          display:flex; align-items:center; gap:10px;
          padding:8px 14px; border-bottom:1px solid var(--divider-color, #f0f0f0);
        }
        .park-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
        .park-name {
          flex:1; min-width:0; font-size:13px; font-weight:500;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .park-desig { font-size:11px; color: var(--secondary-text-color, #888); }
        .park-btn {
          flex-shrink:0; padding:5px 10px; border:none; border-radius:5px;
          font-size:12px; cursor:pointer; color:#fff; white-space:nowrap;
        }
        .no-parks { padding:20px; text-align:center; color: var(--secondary-text-color, #888); font-size:13px; }
      </style>

      <style id="theme-vars"></style>

      <div id="map-wrap">
        <svg id="us-map"
             viewBox="0 0 ${SVG_W} ${SVG_H}"
             preserveAspectRatio="xMidYMid meet">
        </svg>

        <div id="icon-layer"></div>

        <div id="popup">
          <button class="popup-close" aria-label="Close">\xD7</button>
          <div id="popup-content"></div>
        </div>
      </div>

      <button id="panel-btn" title="Browse parks">\u2261</button>

      <div id="panel">
        <div class="panel-header">
          <span>Parks</span>
          <button class="panel-close">\xD7</button>
        </div>
        <div class="panel-search">
          <input type="text" placeholder="Search parks\u2026" id="search-input">
        </div>
        <div id="park-list"></div>
      </div>
    `;
    this.shadowRoot.querySelector("#panel-btn").addEventListener("click", () => this._togglePanel());
    this.shadowRoot.querySelector(".panel-close").addEventListener("click", () => this._closePanel());
    this.shadowRoot.querySelector("#search-input").addEventListener("input", (e) => {
      this._search = e.target.value;
      this._renderParkList();
    });
    this.shadowRoot.querySelector(".popup-close").addEventListener("click", () => this._hidePopup());
    this.shadowRoot.querySelector("#map-wrap").addEventListener("click", (e) => {
      if (!e.target.closest("[data-park-code]")) this._hidePopup();
    });
    this._applyConfig();
    this._renderMap(topoData);
    this._initialized = true;
    if (this._hass) this._updateMarkers();
  }
  // ── Theming ────────────────────────────────────────────────────────────────
  // Resolves theme_mode ('auto' | 'light' | 'dark') to an actual
  // light/dark decision. 'auto' follows Home Assistant's own dark mode
  // flag so the card matches the dashboard without any extra config.
  _isDarkMode() {
    const mode = this._config.theme_mode;
    if (mode === "light") return false;
    if (mode === "dark") return true;
    return !!(this._hass && this._hass.themes && this._hass.themes.darkMode);
  }
  // Pushes the resolved light/dark map colors in as CSS custom
  // properties on the host element. Custom properties inherit through
  // the shadow boundary, so the shadow tree's own stylesheet (.state,
  // .territory, :host background) picks these up automatically —
  // nothing inside the shadow root needs to be touched or rebuilt.
  _applyThemeColors() {
    const c = this._config;
    const dark = this._isDarkMode();
    const background = dark ? c.dark_background_color : c.light_background_color;
    const land = dark ? c.dark_land_color : c.light_land_color;
    const border = dark ? c.dark_border_color : c.light_border_color;
    const coastline = dark ? c.dark_coastline_color : c.light_coastline_color;
    const noBg = c.show_background === false;
    this.style.setProperty("--nps-ocean-color", noBg ? "transparent" : background);
    if (noBg) this.style.setProperty("--nps-card-shadow", "none");
    else this.style.removeProperty("--nps-card-shadow");
    const themeVarsEl = this.shadowRoot?.getElementById("theme-vars");
    if (themeVarsEl) {
      themeVarsEl.textContent = `
                .state { fill: ${land}; stroke: ${border}; }
                .territory { fill: ${land}; stroke: ${coastline}; }
                .nation-border { stroke: ${coastline}; }
            `;
    }
  }
  // ── Config application (live-updatable, no full rebuild needed) ──────────
  _applyConfig() {
    this._applyThemeColors();
    if (this._initialized) {
      this._lastEntities = null;
      if (this._hass) this._updateMarkers();
    }
  }
  // ── Map rendering ──────────────────────────────────────────────────────────
  _renderMap(topoData) {
    const svgEl = this.shadowRoot.querySelector("#us-map");
    const svg = select_default2(svgEl);
    this._projection = (0, import_geo_albers_usa_territories.geoAlbersUsaTerritories)();
    const path = (0, import_d3_geo.geoPath)().projection(this._projection);
    const states = feature_default(topoData, topoData.objects.states);
    svg.append("g").attr("class", "states-group").selectAll("path").data(states.features).join("path").attr("class", (d) => Number(d.id) >= 60 ? "territory" : "state").attr("d", path);
    svg.append("path").datum(mesh_default(topoData, topoData.objects.states, (a, b) => a === b)).attr("class", "nation-border").attr("d", path);
    svg.append("g").attr("id", "markers");
  }
  // ── Coordinate routing ────────────────────────────────────────────────────
  _getProjectedPoint(lat, lon) {
    const pt = this._projection([lon, lat]);
    return pt ? { x: pt[0], y: pt[1] } : null;
  }
  // ── Park entities ─────────────────────────────────────────────────────────
  _getParkEntities() {
    if (!this._hass) return [];
    return Object.values(this._hass.states).filter(
      (e) => e.attributes.park_code != null && e.attributes.latitude != null && e.attributes.longitude != null && (e.state === "visited" || e.state === "unvisited")
    );
  }
  // ── Marker management ─────────────────────────────────────────────────────
  _markerStyleFor(isVisited) {
    const c = this._config;
    return {
      icon: isVisited ? c.visited_icon : c.unvisited_icon,
      color: isVisited ? c.visited_color : c.unvisited_color,
      opacity: isVisited ? c.visited_opacity : c.unvisited_opacity,
      size: isVisited ? c.visited_marker_size : c.unvisited_marker_size
    };
  }
  _updateMarkers() {
    if (!this._projection) return;
    const markerGroup = this.shadowRoot.querySelector("#markers");
    const iconLayer = this.shadowRoot.querySelector("#icon-layer");
    if (!markerGroup || !iconLayer) return;
    const entities = this._getParkEntities();
    if (this._lastEntities && entities.length === this._lastEntities.size && entities.every((e) => this._lastEntities.get(e.attributes.park_code) === e)) {
      return;
    }
    this._lastEntities = new Map(entities.map((e) => [e.attributes.park_code, e]));
    const seen = /* @__PURE__ */ new Set();
    entities.forEach((entity) => {
      const code = entity.attributes.park_code;
      const lat = parseFloat(entity.attributes.latitude);
      const lon = parseFloat(entity.attributes.longitude);
      const isVisited = entity.state === "visited";
      seen.add(code);
      const style = this._markerStyleFor(isVisited);
      const wantType = style.icon ? "icon" : "circle";
      const existing = this._markers[code];
      if (existing && existing.type !== wantType) {
        existing.el.remove();
        delete this._markers[code];
      }
      if (this._markers[code]) {
        this._restyleMarker(this._markers[code], style);
        return;
      }
      const pt = this._getProjectedPoint(lat, lon);
      if (!pt) return;
      const el = wantType === "icon" ? this._createIconMarker(code, pt, style) : this._createCircleMarker(code, pt, style);
      this._markers[code] = { type: wantType, el, pt };
    });
    Object.keys(this._markers).forEach((code) => {
      if (!seen.has(code)) {
        this._markers[code].el.remove();
        delete this._markers[code];
      }
    });
    if (this._panelOpen) this._renderParkList();
  }
  _restyleMarker(marker, style) {
    const { type, el } = marker;
    if (type === "circle") {
      el.dataset.baseSize = style.size;
      el.setAttribute("r", style.size / 2);
      el.setAttribute("fill", style.color);
      el.setAttribute("fill-opacity", style.opacity);
    } else {
      el.style.width = `${style.size}px`;
      el.style.height = `${style.size}px`;
      const icon = el.querySelector("ha-icon");
      icon.setAttribute("icon", style.icon);
      icon.style.color = style.color;
      icon.style.opacity = style.opacity;
      icon.style.setProperty("--mdc-icon-size", `${style.size}px`);
    }
  }
  _createCircleMarker(code, pt, style) {
    const markerGroup = this.shadowRoot.querySelector("#markers");
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("class", "park-marker");
    circle.dataset.parkCode = code;
    circle.setAttribute("cx", pt.x);
    circle.setAttribute("cy", pt.y);
    this._restyleMarker({ type: "circle", el: circle }, style);
    circle.addEventListener("mouseenter", () => circle.setAttribute("r", parseFloat(circle.getAttribute("r")) + 2));
    circle.addEventListener("mouseleave", () => circle.setAttribute("r", parseFloat(circle.dataset.baseSize) / 2));
    circle.addEventListener("click", (e) => {
      e.stopPropagation();
      this._showPopup(code, pt.x, pt.y);
    });
    markerGroup.appendChild(circle);
    return circle;
  }
  _createIconMarker(code, pt, style) {
    const iconLayer = this.shadowRoot.querySelector("#icon-layer");
    const wrapper = document.createElement("div");
    wrapper.className = "icon-marker";
    wrapper.dataset.parkCode = code;
    wrapper.style.left = `${pt.x / SVG_W * 100}%`;
    wrapper.style.top = `${pt.y / SVG_H * 100}%`;
    wrapper.appendChild(document.createElement("ha-icon"));
    this._restyleMarker({ type: "icon", el: wrapper }, style);
    wrapper.addEventListener("click", (e) => {
      e.stopPropagation();
      this._showPopup(code, pt.x, pt.y);
    });
    iconLayer.appendChild(wrapper);
    return wrapper;
  }
  // ── Popup (card-level DOM overlay, not constrained to any inset) ──────────
  _showPopup(code, svgX, svgY) {
    const entity = this._getParkEntities().find((e) => e.attributes.park_code === code);
    if (!entity) return;
    const a = entity.attributes;
    const isVisited = entity.state === "visited";
    const img = a.image;
    const rawDesc = a.description || "";
    const desc = rawDesc.slice(0, 220);
    const meta = [a.designation, a.states].filter(Boolean).join(" \u2022 ");
    this.shadowRoot.querySelector("#popup-content").innerHTML = `
      ${img ? `<img class="popup-img" src="${escapeHtml(img.url)}" alt="${escapeHtml(img.alt_text || "")}">` : ""}
      <div class="popup-body">
        <div class="popup-name">${escapeHtml(a.friendly_name || entity.entity_id)}</div>
        ${meta ? `<div class="popup-meta">${escapeHtml(meta)}</div>` : ""}
        <div class="popup-desc">${escapeHtml(desc)}${rawDesc.length > 220 ? "\u2026" : ""}</div>
        ${a.url ? `<a class="popup-link" href="${escapeHtml(a.url)}" target="_blank" rel="noopener"
            style="color:${this._config.visited_color}">Learn more \u2192</a>` : ""}
        <button class="popup-toggle"
          style="background:${isVisited ? "#c0392b" : this._config.visited_color}"
          data-code="${escapeHtml(code)}" data-state="${escapeHtml(entity.state)}">
          ${isVisited ? "\u2713 Visited \u2014 Mark Unvisited" : "Mark as Visited"}
        </button>
      </div>
    `;
    this.shadowRoot.querySelector(".popup-toggle").addEventListener("click", (e) => {
      const { code: c, state } = e.currentTarget.dataset;
      this._hass.callService("nps_parks", state === "visited" ? "mark_unvisited" : "mark_visited", { park_code: c });
      this._hidePopup();
    });
    const popup = this.shadowRoot.querySelector("#popup");
    const svgEl = this.shadowRoot.querySelector("#us-map");
    const wrapEl = this.shadowRoot.querySelector("#map-wrap");
    popup.style.visibility = "hidden";
    popup.classList.add("visible");
    const popRect = popup.getBoundingClientRect();
    const popW = popRect.width, popH = popRect.height;
    const svgRect = svgEl.getBoundingClientRect();
    const wrapRect = wrapEl.getBoundingClientRect();
    const sx = svgRect.width / SVG_W;
    const sy = svgRect.height / SVG_H;
    let px = svgRect.left - wrapRect.left + svgX * sx + 12;
    let py = svgRect.top - wrapRect.top + svgY * sy - 70;
    const maxX = wrapRect.width - popW - 8;
    const maxY = wrapRect.height - popH - 8;
    if (px > maxX) px = svgX * sx - popW - 12 + (svgRect.left - wrapRect.left);
    if (px < 8) px = 8;
    if (py > maxY) py = maxY;
    if (py < 8) py = 8;
    popup.style.left = px + "px";
    popup.style.top = py + "px";
    popup.style.visibility = "";
  }
  _hidePopup() {
    this.shadowRoot.querySelector("#popup").classList.remove("visible");
  }
  // ── Panel ─────────────────────────────────────────────────────────────────
  _togglePanel() {
    this._panelOpen ? this._closePanel() : this._openPanel();
  }
  _openPanel() {
    this._panelOpen = true;
    this.shadowRoot.querySelector("#panel").classList.add("open");
    this._renderParkList();
  }
  _closePanel() {
    this._panelOpen = false;
    this.shadowRoot.querySelector("#panel").classList.remove("open");
  }
  _renderParkList() {
    const list = this.shadowRoot.querySelector("#park-list");
    if (!list) return;
    const search = this._search.toLowerCase();
    const entities = this._getParkEntities().filter((e) => !search || (e.attributes.friendly_name || "").toLowerCase().includes(search)).sort((a, b) => (a.attributes.friendly_name || "").localeCompare(b.attributes.friendly_name || ""));
    if (!entities.length) {
      list.innerHTML = '<div class="no-parks">No parks found</div>';
      return;
    }
    list.innerHTML = entities.map((e) => {
      const isVisited = e.state === "visited";
      const color = isVisited ? this._config.visited_color : this._config.unvisited_color;
      const name = e.attributes.friendly_name || e.entity_id;
      const desig = e.attributes.designation || "";
      const code = e.attributes.park_code;
      return `
        <div class="park-row">
          <div class="park-dot" style="background:${color}"></div>
          <div style="flex:1;min-width:0">
            <div class="park-name">${escapeHtml(name)}</div>
            <div class="park-desig">${escapeHtml(desig)}</div>
          </div>
          <button class="park-btn" data-code="${escapeHtml(code)}" data-state="${escapeHtml(e.state)}"
            style="background:${isVisited ? "#c0392b" : this._config.visited_color}">
            ${isVisited ? "Unvisit" : "Visit"}
          </button>
        </div>
      `;
    }).join("");
    list.querySelectorAll(".park-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const { code, state } = e.currentTarget.dataset;
        this._hass.callService("nps_parks", state === "visited" ? "mark_unvisited" : "mark_visited", { park_code: code });
      });
    });
  }
  getCardSize() {
    const wrap = this.shadowRoot?.querySelector("#map-wrap");
    const renderedHeight = wrap?.clientHeight;
    const height = renderedHeight || 420 * (SVG_H / SVG_W);
    return Math.max(1, Math.round(height / 50));
  }
  // A custom editor element (rather than the schema-only getConfigForm
  // API) so unset options can display their live defaults instead of
  // blank fields — ha-form only shows what's literally in the data it's
  // given, and getConfigForm gives no hook to inject merged defaults.
  static getConfigElement() {
    return document.createElement("nps-parks-card-editor");
  }
};
var NPSParksCardEditor = class extends HTMLElement {
  setConfig(config) {
    this._config = config || {};
    this._render();
  }
  set hass(hass) {
    this._hass = hass;
    if (this._form) this._form.hass = hass;
    if (this._markerForms) {
      for (const group of MARKER_GROUPS) this._markerForms[group.key].hass = hass;
    }
  }
  _render() {
    if (!this._built) this._build();
    if (this._hass) {
      this._form.hass = this._hass;
      for (const group of MARKER_GROUPS) this._markerForms[group.key].hass = this._hass;
    }
    const flat = flattenConfig(this._config);
    const merged = { ...optionDefaults(flat) };
    for (const key of Object.keys(merged)) {
      if (flat[key] !== void 0 && flat[key] !== null && flat[key] !== "") {
        merged[key] = flat[key];
      }
    }
    const data = {};
    for (const key of MAIN_FORM_KEYS) {
      const section = OPTION_SECTION[key];
      if (section) (data[section] = data[section] || {})[key] = merged[key];
      else data[key] = merged[key];
    }
    this._form.schema = FORM_SCHEMA;
    this._form.data = data;
    for (const group of MARKER_GROUPS) {
      const gdata = {};
      for (const field of group.fields) gdata[field.name] = merged[field.name];
      const form = this._markerForms[group.key];
      form.schema = group.fields;
      form.data = gdata;
    }
    for (const [key, input] of Object.entries(this._colorInputs)) {
      const v = merged[key];
      input.value = typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v) ? v : "#000000";
    }
  }
  _build() {
    this._built = true;
    this._colorInputs = {};
    this._markerForms = {};
    const style = document.createElement("style");
    style.textContent = `
            .nps-color-group { margin-top: 12px; }
            .nps-color-rows { padding: 4px 16px 12px; }
            .nps-color-row {
                display: flex; align-items: center; justify-content: space-between;
                padding: 6px 0;
            }
            .nps-color-row label {
                color: var(--primary-text-color);
                font-size: 14px;
            }
            .nps-color-row input[type="color"] {
                width: 52px; height: 32px; padding: 2px;
                border: 1px solid var(--divider-color, #ccc);
                border-radius: 6px;
                background: var(--card-background-color, #fff);
                cursor: pointer;
            }
        `;
    this.appendChild(style);
    this._form = document.createElement("ha-form");
    this._form.computeLabel = (schema) => schema.title || (schema.name.charAt(0).toUpperCase() + schema.name.slice(1)).replace(/_/g, " ");
    this._form.addEventListener("value-changed", (ev) => {
      ev.stopPropagation();
      this._formChanged(ev.detail.value);
    });
    this.appendChild(this._form);
    for (const group of MARKER_GROUPS) {
      const panel = document.createElement("ha-expansion-panel");
      panel.className = "nps-color-group";
      panel.outlined = true;
      panel.header = group.title;
      const form = document.createElement("ha-form");
      form.computeLabel = (schema) => schema.title || (schema.name.charAt(0).toUpperCase() + schema.name.slice(1)).replace(/_/g, " ");
      form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        this._markerFormChanged(group, ev.detail.value);
      });
      panel.appendChild(form);
      this._markerForms[group.key] = form;
      const rows = document.createElement("div");
      rows.className = "nps-color-rows";
      rows.appendChild(this._buildColorRow(group.colorKey, group.colorLabel));
      panel.appendChild(rows);
      this.appendChild(panel);
    }
    for (const group of COLOR_GROUPS) {
      const panel = document.createElement("ha-expansion-panel");
      panel.className = "nps-color-group";
      panel.outlined = true;
      panel.header = group.title;
      const rows = document.createElement("div");
      rows.className = "nps-color-rows";
      for (const [key, label] of group.keys) rows.appendChild(this._buildColorRow(key, label));
      panel.appendChild(rows);
      this.appendChild(panel);
    }
  }
  // Builds one label-left / swatch-right color row and registers its
  // input in this._colorInputs, keyed by option name (shared by both
  // MARKER_GROUPS and COLOR_GROUPS panels).
  _buildColorRow(key, label) {
    const row = document.createElement("div");
    row.className = "nps-color-row";
    const labelEl = document.createElement("label");
    labelEl.textContent = label;
    const input = document.createElement("input");
    input.type = "color";
    input.addEventListener("input", (e) => this._colorChanged(key, e.target.value));
    row.appendChild(labelEl);
    row.appendChild(input);
    this._colorInputs[key] = input;
    return row;
  }
  // ha-form fired: fold its (nested) values into the flat working config.
  // Take form-managed keys from the form verbatim — including cleared
  // ones — so e.g. removing an icon actually unsets it.
  _formChanged(value) {
    const formFlat = flattenConfig(value);
    const flat = flattenConfig(this._config);
    for (const key of MAIN_FORM_KEYS) {
      if (formFlat[key] === void 0) delete flat[key];
      else flat[key] = formFlat[key];
    }
    this._commit(flat);
  }
  // Same as _formChanged, but scoped to one marker group's own fields —
  // each marker panel has its own ha-form instance, so a change in one
  // must not be read as "everything else was cleared".
  _markerFormChanged(group, value) {
    const formFlat = flattenConfig(value);
    const flat = flattenConfig(this._config);
    for (const field of group.fields) {
      const key = field.name;
      if (formFlat[key] === void 0) delete flat[key];
      else flat[key] = formFlat[key];
    }
    this._commit(flat);
  }
  _colorChanged(key, value) {
    const flat = flattenConfig(this._config);
    flat[key] = value;
    this._commit(flat);
  }
  // Strip anything equal to its (preset-aware) default, re-nest
  // form-managed options into their sections, keep colors flat, preserve
  // all non-option keys (type, view_layout, legacy marker_radius, …).
  _commit(flat) {
    const defaults = optionDefaults(flat);
    const out = {};
    for (const [key, v] of Object.entries(this._config)) {
      if (key in defaults || ALL_SECTION_NAMES.includes(key)) continue;
      out[key] = v;
    }
    for (const key of Object.keys(defaults)) {
      const v = flat[key];
      if (v === void 0 || v === null || v === "") continue;
      if (optionEquals(v, defaults[key])) continue;
      const section = OPTION_SECTION[key];
      if (section) (out[section] = out[section] || {})[key] = v;
      else out[key] = v;
    }
    this._config = out;
    this._render();
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: out },
      bubbles: true,
      composed: true
    }));
  }
};
if (!customElements.get("nps-parks-card-editor")) {
  customElements.define("nps-parks-card-editor", NPSParksCardEditor);
}
if (!customElements.get("nps-parks-card")) {
  customElements.define("nps-parks-card", NPSParksCard);
}
window.customCards = window.customCards || [];
if (!window.customCards.find((c) => c.type === "nps-parks-card")) {
  window.customCards.push({
    type: "nps-parks-card",
    name: "NPS Parks Card",
    description: "Interactive map for tracking National Park Service site visits",
    preview: false
  });
}
