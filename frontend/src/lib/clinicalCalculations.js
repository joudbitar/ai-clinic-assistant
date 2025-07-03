// Clinical calculation utilities for EMR system

/**
 * Calculate BMI from weight and height
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @returns {Object} - BMI value, category, and color
 */
export function calculateBMI(weight, height) {
  if (!weight || !height || weight <= 0 || height <= 0) {
    return { value: null, category: null, color: null };
  }

  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  const roundedBMI = Math.round(bmi * 10) / 10;

  let category, color;

  if (bmi < 18.5) {
    category = "Underweight";
    color = "bg-blue-100 text-blue-800";
  } else if (bmi < 25) {
    category = "Normal";
    color = "bg-green-100 text-green-800";
  } else if (bmi < 30) {
    category = "Overweight";
    color = "bg-yellow-100 text-yellow-800";
  } else if (bmi < 35) {
    category = "Obese Class I";
    color = "bg-orange-100 text-orange-800";
  } else if (bmi < 40) {
    category = "Obese Class II";
    color = "bg-red-100 text-red-800";
  } else {
    category = "Obese Class III";
    color = "bg-red-200 text-red-900";
  }

  return {
    value: roundedBMI,
    category,
    color,
  };
}

/**
 * Determine cancer stage from TNM classification
 * @param {string} tnm_t - T stage
 * @param {string} tnm_n - N stage
 * @param {string} tnm_m - M stage
 * @returns {Object} - Stage, description, and color
 */
export function determineCancerStage(tnm_t, tnm_n, tnm_m) {
  if (!tnm_t || !tnm_n || !tnm_m) {
    return { stage: null, description: null, color: null };
  }

  const t = tnm_t.toLowerCase().replace(/[^\w\d]/g, "");
  const n = tnm_n.toLowerCase().replace(/[^\w\d]/g, "");
  const m = tnm_m.toLowerCase().replace(/[^\w\d]/g, "");

  // M1 = Stage IV regardless of T and N
  if (m === "m1") {
    return {
      stage: "Stage IV",
      description: "Distant metastasis present",
      color: "bg-red-100 text-red-800",
    };
  }

  // M0 cases - determine stage based on T and N
  if (m === "m0") {
    // Stage 0 (Carcinoma in situ)
    if (t === "tis") {
      return {
        stage: "Stage 0",
        description: "Carcinoma in situ",
        color: "bg-gray-100 text-gray-800",
      };
    }

    // Stage I
    if (
      (t === "t1" || t === "t1a" || t === "t1b" || t === "t1c") &&
      n === "n0"
    ) {
      return {
        stage: "Stage I",
        description: "Early stage, localized",
        color: "bg-green-100 text-green-800",
      };
    }

    // Stage IIA
    if (
      ((t === "t2" || t === "t2a" || t === "t2b") && n === "n0") ||
      (t === "t1" && (n === "n1" || n === "n1a"))
    ) {
      return {
        stage: "Stage IIA",
        description: "Early stage, limited spread",
        color: "bg-blue-100 text-blue-800",
      };
    }

    // Stage IIB
    if (
      ((t === "t3" || t === "t3a" || t === "t3b") && n === "n0") ||
      ((t === "t2" || t === "t2a" || t === "t2b") &&
        (n === "n1" || n === "n1a"))
    ) {
      return {
        stage: "Stage IIB",
        description: "Moderate local extension",
        color: "bg-blue-200 text-blue-900",
      };
    }

    // Stage IIIA
    if (
      ((t === "t1" || t === "t2") &&
        (n === "n2" || n === "n2a" || n === "n2b")) ||
      ((t === "t3" || t === "t3a" || t === "t3b") &&
        (n === "n1" || n === "n1a" || n === "n1b"))
    ) {
      return {
        stage: "Stage IIIA",
        description: "Advanced local disease",
        color: "bg-yellow-100 text-yellow-800",
      };
    }

    // Stage IIIB
    if (
      ((t === "t4" || t === "t4a" || t === "t4b") &&
        (n === "n0" || n === "n1" || n === "n2")) ||
      ((t === "t1" || t === "t2" || t === "t3") &&
        (n === "n3" || n === "n3a" || n === "n3b"))
    ) {
      return {
        stage: "Stage IIIB",
        description: "Extensive local/regional disease",
        color: "bg-orange-100 text-orange-800",
      };
    }

    // Stage IIIC
    if (t === "t4" && (n === "n3" || n === "n3a" || n === "n3b")) {
      return {
        stage: "Stage IIIC",
        description: "Extensive local and nodal disease",
        color: "bg-red-100 text-red-700",
      };
    }

    // Default for unmatched patterns
    return {
      stage: "Stage Unknown",
      description: `T${tnm_t} N${tnm_n} M${tnm_m}`,
      color: "bg-gray-100 text-gray-600",
    };
  }

  return { stage: null, description: null, color: null };
}

/**
 * Calculate pack-years from smoking history text
 * @param {string} description - Smoking history description
 * @returns {Object} - Pack-years value and interpretation
 */
export function calculatePackYears(description) {
  if (!description) {
    return { packYears: null, interpretation: null, color: null };
  }

  const text = description.toLowerCase();

  // Look for pack-years pattern first
  const packYearMatch = text.match(/(\d+(?:\.\d+)?)\s*pack[\s-]*years?/);
  if (packYearMatch) {
    const packYears = parseFloat(packYearMatch[1]);
    return formatPackYearsResult(packYears);
  }

  // Try to extract packs per day and years
  const packsMatch = text.match(/(\d+(?:\.\d+)?)\s*packs?\s*per\s*day/);
  const yearsMatch = text.match(/(\d+)\s*years?/);

  if (packsMatch && yearsMatch) {
    const packsPerDay = parseFloat(packsMatch[1]);
    const years = parseInt(yearsMatch[1]);
    const packYears = packsPerDay * years;
    return formatPackYearsResult(packYears);
  }

  // Try cigarettes per day (20 cigarettes = 1 pack)
  const cigarettesMatch = text.match(/(\d+)\s*cigarettes?\s*per\s*day/);
  if (cigarettesMatch && yearsMatch) {
    const cigarettesPerDay = parseInt(cigarettesMatch[1]);
    const years = parseInt(yearsMatch[1]);
    const packsPerDay = cigarettesPerDay / 20;
    const packYears = packsPerDay * years;
    return formatPackYearsResult(packYears);
  }

  return { packYears: null, interpretation: null, color: null };
}

function formatPackYearsResult(packYears) {
  const rounded = Math.round(packYears * 10) / 10;

  let interpretation, color;

  if (packYears < 10) {
    interpretation = "Light smoking history";
    color = "bg-yellow-100 text-yellow-800";
  } else if (packYears < 20) {
    interpretation = "Moderate smoking history";
    color = "bg-orange-100 text-orange-800";
  } else if (packYears < 30) {
    interpretation = "Heavy smoking history";
    color = "bg-red-100 text-red-800";
  } else {
    interpretation = "Very heavy smoking history";
    color = "bg-red-200 text-red-900";
  }

  return {
    packYears: rounded,
    interpretation,
    color,
  };
}

/**
 * Extract numeric values from text for smoking calculations
 * @param {string} text - Input text
 * @returns {Object} - Extracted numeric data
 */
export function extractSmokingData(text) {
  if (!text) return {};

  const lowText = text.toLowerCase();
  const result = {};

  // Extract years smoked
  const yearsMatch = lowText.match(/(\d+)\s*years?/);
  if (yearsMatch) {
    result.years = parseInt(yearsMatch[1]);
  }

  // Extract packs per day
  const packsMatch = lowText.match(/(\d+(?:\.\d+)?)\s*packs?\s*per\s*day/);
  if (packsMatch) {
    result.packsPerDay = parseFloat(packsMatch[1]);
  }

  // Extract cigarettes per day
  const cigarettesMatch = lowText.match(/(\d+)\s*cigarettes?\s*per\s*day/);
  if (cigarettesMatch) {
    result.cigarettesPerDay = parseInt(cigarettesMatch[1]);
    result.packsPerDay = result.cigarettesPerDay / 20;
  }

  return result;
}

/**
 * Format display text for clinical calculations
 */
export function formatClinicalMetric(value, unit, category) {
  if (value === null || value === undefined) return "";
  return `${value} ${unit}${category ? ` (${category})` : ""}`;
}
