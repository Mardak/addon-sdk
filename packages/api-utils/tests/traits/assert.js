"use strict";

var BaseAssert = require("test/assert").Assert;

/**
 * Whether or not given property descriptors are equivalent. They are
 * equivalent either if both are marked as "conflict" or "required" property
 * or if all the properties of descriptors are equal.
 * @param {Object} actual
 * @param {Object} expected
 */
function equivalentDescriptors(actual, expected) {
  return (actual.conflict && expected.conflict) ||
         (actual.required && expected.required) ||
         equalDescriptors(actual, expected);
}

function equalDescriptors(actual, expected) {
  return actual.get === expected.get &&
         actual.set === expected.set &&
         actual.value === expected.value &&
         (actual.enumerable !== true) === (expected.enumerable !== true) &&
         (actual.configurable !== true) === (expected.configurable !== true) &&
         (actual.writable !== true) === (expected.writable !== true);
}

/**
 * Whether or not given `target` array contains all the element
 * from a given `source` array.
 */
function containsSet(source, target) {
  return source.some(function(element) {
    return 0 > target.indexOf(element);
  });
}

/**
 * Whether or not given two arrays contain all elements from another.
 */
function equivalentSets(source, target) {
  return containsSet(source, target) && containsSet(target, source);
}

/**
 * Finds name of the property from `source` property descriptor map, that
 * is not equivalent of the name named property in the `target` property
 * descriptor map. If not found `null` is returned instead.
 */
function findNonEquivalentPropertyName(source, target) {
  var value = null;
  Object.getOwnPropertyNames(source).some(function(key) {
    var areEquivalent = false;
    if (!equivalentDescriptors(source[key], target[key])) {
      value = key;
      areEquivalent = true;
    }
    return areEquivalent;
  });
  return value;
}

var AssertDescriptor = {
  equalTraits: {
    value: function equivalentTraits(actual, expected, message) {
      var difference;
      var actualKeys = Object.getOwnPropertyNames(actual);
      var expectedKeys = Object.getOwnPropertyNames(expected);

      if (equivalentSets(actualKeys, expectedKeys)) {
        this.fail({
          operator: "equalTraits",
          message: "Traits define different properties",
          actual: actualKeys.sort().join(","),
          expected: expectedKeys.sort().join(","),
        });
      }
      else if (difference = findNonEquivalentPropertyName(actual, expected)) {
        this.fail({
          operator: "equalTraits",
          message: "Traits define non-equivalent property `" + difference + "`",
          actual: actual[difference],
          expected: expected[difference]
        });
      }
      else {
        this.pass(message || "Traits are equivalent.");
      }
    }
  }
};

exports.Assert = function Assert() {
  return Object.create(BaseAssert.apply(null, arguments), AssertDescriptor);
};
