import { useState, useEffect, useMemo, useRef } from "react";
import { Preferences } from "@capacitor/preferences";

/* ============================================================
   1. CURRICULUM DATA
   Sections in rotation-aligned order. Endocrinology is present
   but empty — its video list was missing from the source doc.
   ============================================================ */

const SECTIONS = [
  { id: "pulm", name: "Pulmonary & Critical Care", qbank: "Respiratory system", videos: [
    "Pulmonary Function Tests", "Asthma", "COPD Diagnosis", "COPD Treatment",
    "Restrictive Lung Disease", "Pneumonia", "Lung Cancer", "Bronchiectasis", "Shock",
    "Respiratory Failure", "Sepsis ARDS", "Pulmonary Hypertension",
    "DVT and Pulmonary Embolism", "Pleural Disease", "Cystic Fibrosis",
  ]},
  { id: "renal", name: "Renal & Genitourinary", qbank: "Renal, urinary system and electrolytes", videos: [
    "Acute Renal Failure", "Chronic Kidney Disease", "Fluids", "Hyponatremia", "Hypernatremia",
    "Potassium Disorders", "Calcium, Magnesium, and Phosphate Disorders", "Acid Base Principles",
    "Metabolic Acidosis", "Metabolic Alkalosis", "Respiratory Acid Base Disorders",
    "Renal Tubular Acidosis", "Nephrotic Syndrome", "Nephritic Syndrome", "RPGN", "Nephrolithiasis",
    "Hematuria", "Urinary Infections", "Urinary Incontinence", "Tubulointerstitial Disorders",
    "Cystic Kidney Disease", "Urinary Tract Malignancy", "Diuretics", "Rhabdomyolysis",
  ]},
  { id: "gi", name: "Gastroenterology", qbank: "Gastrointestinal system", videos: [
    "Esophageal Disorders", "GERD and Esophageal Cancer", "Gastric Disorders", "Gastric Cancer",
    "Liver Disease", "Liver Masses", "Cirrhosis", "Viral Hepatitis", "Hyperbilirubinemia",
    "Wilson's Disease", "Hemochromatosis", "Biliary Disease", "Gallstone Disease", "Pancreatic Cancer",
    "Pancreatitis", "Colon Cancer", "Colorectal Disease", "Small Bowel Disease",
    "Inflammatory Bowel Disease", "Diarrhea", "Gastrointestinal Bleeding", "Hernias", "Malabsorption",
    "Gastrointestinal Pharmacology",
  ]},
  { id: "id", name: "Infectious Disease", qbank: "Infectious diseases", videos: [
    "Penicillins", "Beta Lactams", "Protein Synthesis Inhibitors", "Other Antibiotics",
    "Fungal Infections", "Antifungal Drugs", "Protozoal Infections", "Malaria", "HIV Infection",
    "HIV Drugs", "HIV Complications", "Tick-borne Illnesses", "Sexually-transmitted Infections",
    "Meningitis", "Tuberculosis", "Adult Vaccinations",
  ]},
  { id: "cards", name: "Cardiology", qbank: "Cardiovascular system", videos: [
    "EKG Interpretation", "ACLS and Tachycardias", "Atrial Fibrillation and Flutter", "Bradycardia",
    "Coronary Artery Disease", "STEMI", "Heart Failure I", "Heart Failure II", "Cardiomyopathy",
    "Heart Murmurs", "Heart Sounds", "Cardiovascular Pharmacology I", "Cardiovascular Pharmacology II",
    "Pericardial Disease", "Valvular Heart Disease", "Hyperlipidemia", "Hypertension",
    "Peripheral Vascular Disease", "Aortic Disease",
  ]},
  { id: "neuro", name: "Neurology", qbank: "Nervous system", videos: [
    "Stroke I", "Stroke II", "Intracranial Bleeding", "Seizures", "Seizure Treatment",
    "Parkinson's Disease", "Movement Disorders", "Multiple Sclerosis", "Demyelinating Disorders",
    "Cerebellar Disorders", "Spinal Cord Disorders", "Neuromuscular Disease",
    "Intracranial Hypertension", "Ventricular Pathology", "Dementia", "Altered Mental Status",
    "Traumatic Brain Injury", "Headache", "Syncope", "Vertigo", "CNS Malignancy",
    "Congenital Neurology",
  ]},
  { id: "heme", name: "Hematology & Oncology", qbank: "Hematology and oncology", videos: [
    "Normocytic Anemias", "Microcytic Anemias", "Thalassemias", "Macrocytic Anemia",
    "Extrinsic Hemolysis", "Intrinsic Hemolysis", "Sickle Cell Disease", "Blood Products",
    "Thrombocytopenia", "Coagulopathy", "Hypercoagulable States", "Antiplatelet Drugs",
    "Anticoagulants", "Plasma Cell Disorders", "Myeloproliferative Disorders", "Acute Leukemias",
    "Chronic Leukemias", "Hodgkin Lymphoma", "Non-Hodgkin Lymphoma", "Amyloidosis",
  ]},
  { id: "psych", name: "Psychiatry", qbank: "Psychiatric and behavioral", videos: [
    "Defense Mechanisms", "Personality Disorders", "Depression", "Mania", "Anxiety Disorders",
    "Psychotic Disorders", "Eating Disorders", "Somatic Disorders", "Dissociative Disorders",
    "Alcohol Use Disorder", "Substance Abuse I", "Substance Abuse II", "Antidepressants",
    "Antipsychotics",
  ]},
  { id: "endo", name: "Endocrinology", qbank: "Endocrine system", videos: [
    "Thyroid Hormone", "Hypothyroidism", "Hyperthyroidism", "Thyroid Nodules",
    "Hyperaldosteronism", "Cushing Syndrome", "Adrenal Insufficiency", "Diabetes Mellitus",
    "Diabetes Complications", "Diabetic Ketoacidosis", "Insulin", "Diabetes Treatment",
    "Pituitary Gland", "Hyperparathyroidism", "Hypoparathyroidism and Vitamin D", "Osteoporosis",
  ]},
  { id: "msk", name: "Musculoskeletal", qbank: "Musculoskeletal system", videos: [
    "Arthritis I", "Arthritis II", "Gout", "Systemic Lupus Erythematosus",
    "Scleroderma and Sjogren's", "Vasculitis", "Spondyloarthritis", "Muscle Disorders",
    "Low Back Pain",
  ]},
  { id: "peds", name: "Pediatrics", qbank: "Pediatrics", videos: [
    "Delivery Room Care", "Newborn Nursery", "Preterm and Postterm Infants",
    "Newborn Hyperbilirubinemia", "Developmental Milestones", "Pediatric Screening",
    "General Pediatrics", "Adolescent Medicine", "Ear Infections and Fevers", "Pediatric Rashes",
    "Vaccination", "Child Abuse", "Pediatric Orthopedics", "Child Psychiatry",
    "Congenital Gastroenterology I", "Congenital Gastroenterology II",
  ]},
  { id: "obgyn", name: "Obstetrics & Gynecology", qbank: "Obstetrics and gynecology", videos: [
    "Normal Pregnancy", "Prenatal Care", "Aneuploidy Screening", "Antepartum Fetal Surveillance",
    "Teratogens", "TORCH Infections", "Perinatal Infections", "Abortion", "Ectopic Pregnancy",
    "Gestational Trophoblastic Disease", "Placental Pathology", "Multiple Gestation",
    "Labor and Delivery I", "Labor and Delivery II", "Intrapartum Fetal Monitoring", "Preterm Labor",
    "Labor and Delivery Complications", "Maternal Pregnancy Complications",
    "Hypertension in Pregnancy", "Postpartum", "Menstrual Cycle", "Contraception",
    "Primary Amenorrhea", "Secondary Amenorrhea", "Dysmenorrhea", "Abnormal Uterine Bleeding",
    "Vaginitis", "Pelvic Inflammatory Disease", "Cervical Cancer", "Uterine Cancer",
    "Adnexal Masses", "Ovarian Neoplasia", "Breast Masses", "Breast Cancer",
  ]},
  { id: "surg", name: "Surgery & Anesthesia", qbank: "Surgery and perioperative care", videos: [
    "Pre-operative Evaluation", "Post-operative Complications", "General Anesthesia",
    "Intravenous Anesthetics", "Neuromuscular Blockers", "Regional and Local Anesthesia",
  ]},
  { id: "em", name: "Emergency Medicine", qbank: "Emergency medicine", videos: [
    "Burns", "Toxicology", "Common Emergencies", "Chest Pain and Dyspnea", "Trauma Basics",
    "Neck and Spinal Trauma", "Chest Trauma", "Abdominal Trauma", "Pelvic Trauma", "Fractures",
  ]},
  { id: "behav", name: "Behavioral Science", qbank: "Ethics, legal and professional", videos: [
    "Ethics Principles", "Informed Consent", "Confidentiality", "Decision-Making Capacity",
    "Public Health", "Quality", "Safety", "Delivering Bad News",
  ]},
  { id: "epi", name: "Epidemiology", qbank: "Epidemiology and biostatistics", videos: [
    "Statistics", "Hypothesis Testing", "Tests of Significance", "Correlations", "Study Designs",
    "Risk Quantification", "Sensitivity and Specificity", "Predictive Values", "Diagnostic Tests",
    "Bias", "Clinical Trials", "Evidence Based Medicine",
  ]},
];

const slug = (s) => s.toLowerCase().replace(/['’.,]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const vid = (sectionId, title) => sectionId + ":" + slug(title);

/* Workload weights. Everything defaults to 1 unit. */
const EST = {
  "cards:ekg-interpretation": 2,
  "cards:acls-and-tachycardias": 1.5,
  "em:toxicology": 2,
  "gi:liver-disease": 1.5,
  "neuro:stroke-i": 1.5,
};

/* Sketchy join table: B&B video id -> Sketchy videos scheduled the same day. */
const SKETCHY = {
  // --- Pulmonary ---
  "pulm:lung-cancer": [{ s: "path", t: "Lung cancer" }],

  // --- Infectious Disease: Micro + antimicrobial Pharm + antibiotic catch-up ---
  "id:penicillins": [
    { s: "micro", t: "Streptococcus pyogenes" },
    { s: "pharm", t: "Nafcillin, oxacillin, methicillin, dicloxacillin" },
  ],
  "id:beta-lactams": [
    { s: "pharm", t: "Monobactams and carbapenems" },
    { s: "pharm", t: "Cephalosporins" },
  ],
  "id:protein-synthesis-inhibitors": [
    { s: "pharm", t: "Tetracyclines" },
    { s: "pharm", t: "Macrolides" },
    { s: "pharm", t: "Clindamycin" },
    { s: "pharm", t: "Linezolid" },
    { s: "pharm", t: "Aminoglycosides" },
  ],
  "id:other-antibiotics": [
    { s: "micro", t: "Enterococcus faecium & faecalis" },
    { s: "pharm", t: "Vancomycin" },
    { s: "pharm", t: "Fluoroquinolones" },
    { s: "pharm", t: "Trimethoprim-sulfamethoxazole" },
    { s: "pharm", t: "Metronidazole" },
  ],
  "id:fungal-infections": [
    { s: "micro", t: "Candida albicans" },
    { s: "micro", t: "Aspergillus fumigatus" },
    { s: "micro", t: "Cryptococcus neoformans" },
    { s: "micro", t: "Mucor & Rhizopus" },
  ],
  "id:antifungal-drugs": [
    { s: "pharm", t: "Amphotericin and flucytosine" },
    { s: "pharm", t: "Azoles" },
  ],
  "id:hiv-infection": [{ s: "micro", t: "HIV" }],
  "id:hiv-complications": [
    { s: "micro", t: "Pneumocystis jirovecii" },
    { s: "micro", t: "Cytomegalovirus" },
  ],
  "id:sexually-transmitted-infections": [
    { s: "micro", t: "Neisseria gonorrhoeae" },
    { s: "micro", t: "Chlamydia trachomatis" },
    { s: "micro", t: "Treponema pallidum" },
    { s: "micro", t: "HSV-1 and HSV-2" },
  ],
  "id:meningitis": [
    { s: "micro", t: "Neisseria meningitidis" },
    { s: "micro", t: "Listeria monocytogenes" },
  ],
  "id:tuberculosis": [
    { s: "micro", t: "Mycobacterium tuberculosis" },
    { s: "pharm", t: "Tuberculosis drugs" },
  ],
  "id:adult-vaccinations": [{ s: "micro", t: "Varicella-zoster virus" }],

  // --- GI ---
  "gi:diarrhea": [
    { s: "micro", t: "Clostridium difficile" },
    { s: "micro", t: "Escherichia coli (ETEC/EHEC)" },
  ],
  "gi:viral-hepatitis": [{ s: "micro", t: "Hepatitis B" }],

  // --- Renal ---
  "renal:acute-renal-failure": [{ s: "path", t: "AKI: prerenal vs ATN vs AIN" }],
  "renal:hyponatremia": [{ s: "path", t: "Osmolality and sodium disorders" }],
  "renal:nephrotic-syndrome": [{ s: "path", t: "Nephrotic syndrome" }],
  "renal:nephritic-syndrome": [{ s: "path", t: "Nephritic syndrome" }],
  "renal:diuretics": [
    { s: "pharm", t: "Loop diuretics" },
    { s: "pharm", t: "Thiazides" },
    { s: "pharm", t: "Potassium-sparing diuretics" },
  ],

  // --- Cardiology ---
  "cards:cardiovascular-pharmacology-i": [
    { s: "pharm", t: "Beta blockers" },
    { s: "pharm", t: "ACE inhibitors, ARBs, aliskiren" },
    { s: "pharm", t: "Calcium-channel blockers" },
  ],
  "cards:cardiovascular-pharmacology-ii": [
    { s: "pharm", t: "Class I antiarrhythmics" },
    { s: "pharm", t: "Class III antiarrhythmics" },
  ],
  "cards:stemi": [
    { s: "pharm", t: "Thrombolytics" },
    { s: "path", t: "MI complications and timeline" },
  ],
  "cards:hyperlipidemia": [{ s: "pharm", t: "Statins" }],
  "cards:coronary-artery-disease": [{ s: "pharm", t: "Nitrates" }],

  // --- Heme ---
  "heme:anticoagulants": [
    { s: "pharm", t: "Heparin, LMWH, direct thrombin and Xa inhibitors" },
    { s: "pharm", t: "Warfarin" },
  ],
  "heme:antiplatelet-drugs": [{ s: "pharm", t: "Antiplatelet agents" }],
  "heme:chronic-leukemias": [{ s: "path", t: "Leukemias and lymphomas" }],

  // --- Neuro / Psych / EM / MSK / OB ---
  "neuro:seizure-treatment": [
    { s: "pharm", t: "Antiepileptic drugs I" },
    { s: "pharm", t: "Antiepileptic drugs II" },
  ],
  "psych:anxiety-disorders": [{ s: "pharm", t: "Benzodiazepines and flumazenil" }],
  "psych:antidepressants": [{ s: "pharm", t: "SSRIs/SNRIs and cyproheptadine" }],
  "psych:mania": [{ s: "pharm", t: "Lithium" }],
  "psych:antipsychotics": [
    { s: "pharm", t: "First-generation antipsychotics" },
    { s: "pharm", t: "Second-generation antipsychotics" },
  ],
  "em:toxicology": [{ s: "pharm", t: "Opioids, naloxone, naltrexone" }],
  "msk:vasculitis": [{ s: "path", t: "Vasculitides" }],
  "obgyn:breast-cancer": [{ s: "path", t: "Breast, ovarian, and bone tumors" }],
};

/* Sketchy topics with no matching B&B video in the current list. */
const SKETCHY_ORPHANS = [
  { s: "path", t: "Immunodeficiencies", why: "No immunology video in the B&B list provided" },
  { s: "path", t: "Congenital heart defects/shunts", why: "No congenital cardiology video in the list" },
];

/* Curated AMBOSS article lists. Anything not listed falls back to the video title. */
const AMBOSS = {
  "pulm:pulmonary-function-tests": ["Pulmonary function testing", "Spirometry"],
  "pulm:asthma": ["Asthma", "Status asthmaticus", "Asthma management"],
  "pulm:copd-diagnosis": ["Chronic obstructive pulmonary disease", "Alpha-1 antitrypsin deficiency"],
  "pulm:copd-treatment": ["Chronic obstructive pulmonary disease", "COPD exacerbation"],
  "pulm:restrictive-lung-disease": ["Interstitial lung disease", "Idiopathic pulmonary fibrosis", "Pneumoconiosis"],
  "pulm:pneumonia": ["Pneumonia", "Community-acquired pneumonia", "Hospital-acquired pneumonia"],
  "pulm:lung-cancer": ["Lung cancer", "Solitary pulmonary nodule", "Paraneoplastic syndromes"],
  "pulm:bronchiectasis": ["Bronchiectasis"],
  "pulm:shock": ["Shock", "Septic shock", "Cardiogenic shock"],
  "pulm:respiratory-failure": ["Respiratory failure", "Mechanical ventilation", "Oxygen therapy"],
  "pulm:sepsis-ards": ["Sepsis", "Acute respiratory distress syndrome"],
  "pulm:pulmonary-hypertension": ["Pulmonary hypertension", "Cor pulmonale"],
  "pulm:dvt-and-pulmonary-embolism": ["Pulmonary embolism", "Deep vein thrombosis", "Venous thromboembolism"],
  "pulm:pleural-disease": ["Pleural effusion", "Pneumothorax", "Light criteria"],
  "pulm:cystic-fibrosis": ["Cystic fibrosis", "Bronchiectasis"],
  "renal:acute-renal-failure": ["Acute kidney injury", "Acute tubular necrosis", "Prerenal AKI"],
  "renal:chronic-kidney-disease": ["Chronic kidney disease", "Dialysis", "Renal osteodystrophy"],
  "renal:fluids": ["Fluid therapy", "Dehydration", "Volume depletion"],
  "renal:hyponatremia": ["Hyponatremia", "SIADH", "Diabetes insipidus"],
  "renal:hypernatremia": ["Hypernatremia", "Diabetes insipidus"],
  "renal:potassium-disorders": ["Hyperkalemia", "Hypokalemia"],
  "renal:calcium-magnesium-and-phosphate-disorders": ["Hypercalcemia", "Hypocalcemia", "Magnesium and phosphate disorders"],
  "renal:acid-base-principles": ["Acid-base disorders", "Anion gap"],
  "renal:metabolic-acidosis": ["Metabolic acidosis", "Lactic acidosis", "Anion gap"],
  "renal:metabolic-alkalosis": ["Metabolic alkalosis"],
  "renal:respiratory-acid-base-disorders": ["Respiratory acidosis", "Respiratory alkalosis"],
  "renal:renal-tubular-acidosis": ["Renal tubular acidosis"],
  "renal:nephrotic-syndrome": ["Nephrotic syndrome", "Glomerular diseases", "Minimal change disease"],
  "renal:nephritic-syndrome": ["Nephritic syndrome", "Poststreptococcal glomerulonephritis", "IgA nephropathy"],
  "renal:rpgn": ["Rapidly progressive glomerulonephritis", "Goodpasture syndrome", "ANCA-associated vasculitis"],
  "renal:nephrolithiasis": ["Nephrolithiasis", "Urolithiasis"],
  "renal:hematuria": ["Hematuria", "Bladder cancer"],
  "renal:urinary-infections": ["Urinary tract infections", "Pyelonephritis", "Cystitis"],
  "renal:urinary-incontinence": ["Urinary incontinence", "Benign prostatic hyperplasia"],
  "renal:tubulointerstitial-disorders": ["Acute interstitial nephritis", "Tubulointerstitial nephritis"],
  "renal:cystic-kidney-disease": ["Autosomal dominant polycystic kidney disease", "Renal cysts"],
  "renal:urinary-tract-malignancy": ["Renal cell carcinoma", "Bladder cancer", "Prostate cancer"],
  "renal:diuretics": ["Diuretics", "Loop diuretics", "Thiazide diuretics"],
  "renal:rhabdomyolysis": ["Rhabdomyolysis", "Compartment syndrome"],

  "gi:esophageal-disorders": ["Achalasia", "Esophageal motility disorders", "Eosinophilic esophagitis"],
  "gi:gerd-and-esophageal-cancer": ["Gastroesophageal reflux disease", "Barrett esophagus", "Esophageal cancer"],
  "gi:gastric-disorders": ["Peptic ulcer disease", "Gastritis", "Helicobacter pylori infection"],
  "gi:gastric-cancer": ["Gastric cancer", "MALT lymphoma"],
  "gi:liver-disease": ["Liver function tests", "Alcoholic liver disease", "Nonalcoholic fatty liver disease"],
  "gi:liver-masses": ["Hepatocellular carcinoma", "Hepatic hemangioma", "Focal nodular hyperplasia"],
  "gi:cirrhosis": ["Cirrhosis", "Portal hypertension", "Hepatic encephalopathy", "Ascites"],
  "gi:viral-hepatitis": ["Viral hepatitis", "Hepatitis B", "Hepatitis C"],
  "gi:hyperbilirubinemia": ["Jaundice", "Gilbert syndrome", "Bilirubin metabolism"],
  "gi:wilsons-disease": ["Wilson disease"],
  "gi:hemochromatosis": ["Hereditary hemochromatosis"],
  "gi:biliary-disease": ["Cholangitis", "Primary biliary cholangitis", "Primary sclerosing cholangitis"],
  "gi:gallstone-disease": ["Cholelithiasis", "Cholecystitis", "Choledocholithiasis"],
  "gi:pancreatic-cancer": ["Pancreatic cancer"],
  "gi:pancreatitis": ["Acute pancreatitis", "Chronic pancreatitis"],
  "gi:colon-cancer": ["Colorectal cancer", "Colorectal cancer screening", "Hereditary colorectal cancer syndromes"],
  "gi:colorectal-disease": ["Diverticular disease", "Hemorrhoids", "Anal fissure"],
  "gi:small-bowel-disease": ["Small bowel obstruction", "Ileus", "Mesenteric ischemia"],
  "gi:inflammatory-bowel-disease": ["Crohn disease", "Ulcerative colitis", "Inflammatory bowel disease"],
  "gi:diarrhea": ["Diarrhea", "Clostridioides difficile infection", "Infectious gastroenteritis"],
  "gi:gastrointestinal-bleeding": ["Upper gastrointestinal bleeding", "Lower gastrointestinal bleeding", "Variceal bleeding"],
  "gi:hernias": ["Abdominal wall hernias", "Inguinal hernia"],
  "gi:malabsorption": ["Celiac disease", "Malabsorption", "Lactose intolerance"],
  "gi:gastrointestinal-pharmacology": ["Proton pump inhibitors", "Antiemetics", "Laxatives"],

  "cards:ekg-interpretation": ["Electrocardiogram", "ECG interpretation", "Cardiac axis"],
  "cards:acls-and-tachycardias": ["Advanced cardiac life support", "Supraventricular tachycardia", "Ventricular tachycardia"],
  "cards:atrial-fibrillation-and-flutter": ["Atrial fibrillation", "Atrial flutter", "CHA2DS2-VASc score"],
  "cards:bradycardia": ["Bradycardia", "Atrioventricular block", "Sick sinus syndrome"],
  "cards:coronary-artery-disease": ["Coronary artery disease", "Stable angina", "Cardiac stress testing"],
  "cards:stemi": ["Myocardial infarction", "Acute coronary syndrome", "STEMI management"],
  "cards:heart-failure-i": ["Heart failure", "Systolic heart failure", "BNP"],
  "cards:heart-failure-ii": ["Heart failure", "Acute decompensated heart failure", "Heart failure management"],
  "cards:cardiomyopathy": ["Cardiomyopathy", "Hypertrophic cardiomyopathy", "Dilated cardiomyopathy"],
  "cards:heart-murmurs": ["Heart murmurs", "Cardiac auscultation"],
  "cards:heart-sounds": ["Heart sounds", "Cardiac auscultation"],
  "cards:cardiovascular-pharmacology-i": ["Beta blockers", "ACE inhibitors", "Calcium channel blockers"],
  "cards:cardiovascular-pharmacology-ii": ["Antiarrhythmic drugs", "Digoxin"],
  "cards:pericardial-disease": ["Pericarditis", "Cardiac tamponade", "Constrictive pericarditis"],
  "cards:valvular-heart-disease": ["Aortic stenosis", "Mitral regurgitation", "Valvular heart disease"],
  "cards:hyperlipidemia": ["Lipid disorders", "Statins", "Cardiovascular risk assessment"],
  "cards:hypertension": ["Arterial hypertension", "Hypertensive crisis", "Secondary hypertension"],
  "cards:peripheral-vascular-disease": ["Peripheral arterial disease", "Chronic venous insufficiency", "Ankle-brachial index"],
  "cards:aortic-disease": ["Aortic dissection", "Abdominal aortic aneurysm", "Thoracic aortic aneurysm"],
};

/* ============================================================
   2. DATE HELPERS
   All day keys are local YYYY-MM-DD. Never use toISOString().
   ============================================================ */

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function dayKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
function parseKey(k) {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}
function addDays(k, n) {
  const d = parseKey(k);
  d.setDate(d.getDate() + n);
  return dayKey(d);
}
function daysBetween(a, b) {
  return Math.round((parseKey(b) - parseKey(a)) / 86400000);
}
function fmtShort(k) {
  const d = parseKey(k);
  return `${MON[d.getMonth()]} ${d.getDate()}`;
}
function fmtLong(k) {
  const d = parseKey(k);
  return `${DOW[d.getDay()]} ${MON[d.getMonth()]} ${d.getDate()}`;
}
function fmtFinish(k) {
  const d = parseKey(k);
  return `${MON[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
const isWeekend = (k) => {
  const g = parseKey(k).getDay();
  return g === 0 || g === 6;
};

/* ============================================================
   3. CURRICULUM ASSEMBLY
   ============================================================ */

function buildCurriculum(state) {
  const extraVideos = (state && state.extraVideos) || {};
  const order = (state && state.settings.sectionOrder) || SECTIONS.map((s) => s.id);
  const byId = {};
  SECTIONS.forEach((s) => (byId[s.id] = s));

  const sections = order
    .filter((id) => byId[id])
    .map((id) => {
      const s = byId[id];
      const titles = s.videos.concat(extraVideos[id] || []);
      return {
        id: s.id,
        name: s.name,
        qbank: s.qbank,
        videos: titles.map((title) => {
          const v = vid(s.id, title);
          return {
            id: v,
            title,
            sectionId: s.id,
            sectionName: s.name,
            qbank: s.qbank,
            est: EST[v] || 1,
            sketchy: SKETCHY[v] || [],
            amboss: AMBOSS[v] || [title],
          };
        }),
      };
    });

  const flat = [];
  sections.forEach((s) => s.videos.forEach((v) => flat.push(v)));
  return { sections, flat, byId: Object.fromEntries(flat.map((v) => [v.id, v])) };
}

/* ============================================================
   4. PHASE + QUESTION ENGINE
   ============================================================ */

const PHASES = [
  { id: "foundation", label: "Foundation", until: "2026-09-30", pass2: 7, pass3: 4, p2: [6, 8], p3: [3, 4] },
  { id: "mixing", label: "Older-review build", until: "2026-11-30", pass2: 6, pass3: 7, p2: [5, 6], p3: [6, 8] },
  { id: "convergence", label: "Transition", until: null, pass2: 12, pass3: 12, p2: [10, 15], p3: [10, 15] },
];
const RANDOM_PHASE = { id: "random", label: "Fully random", pass2: 0, pass3: 0, p2: [0, 0], p3: [0, 0] };

function phaseFor(key, state, videosLeft) {
  if (state.settings.phaseOverride) {
    if (state.settings.phaseOverride === "random") return RANDOM_PHASE;
    return PHASES.find((p) => p.id === state.settings.phaseOverride) || PHASES[0];
  }
  if (videosLeft <= 0) return RANDOM_PHASE;
  for (const p of PHASES) {
    if (!p.until || key <= p.until) return p;
  }
  return PHASES[PHASES.length - 1];
}

/* ============================================================
   5. SCHEDULING ENGINE — schedule is never stored, only derived
   ============================================================ */

function baseCapacity(key, settings) {
  const g = parseKey(key).getDay();
  if (g === 0) return settings.sunVideos;
  if (g === 6) return settings.satVideos;
  return settings.weekdayVideos;
}

function dayType(key, state) {
  const d = state.days[key];
  return (d && d.type) || "normal";
}

function capacityFor(key, state) {
  if (dayType(key, state) === "off") return 0;
  return baseCapacity(key, state.settings);
}

function computeEngine(cur, state, today) {
  const S = state.settings;
  const pre = new Set(state.preCompleted || []);
  const doneByDay = {};
  const doneIds = new Set();
  let loggedUnits = 0;

  const loggedOn = {};
  Object.keys(state.days).forEach((k) => {
    const d = state.days[k];
    (d.videosDone || []).forEach((id) => {
      doneIds.add(id);
      doneByDay[id] = k;
      const v = cur.byId[id];
      if (!v) return;
      (loggedOn[k] = loggedOn[k] || []).push(v);
      // Today's work is settled against today's target, not against the debt.
      if (k >= S.startDate && k < today) loggedUnits += v.est;
    });
    if (d.partial && k >= S.startDate && k < today) loggedUnits += d.partial;
  });

  const remaining = cur.flat.filter((v) => !pre.has(v.id) && !doneIds.has(v.id));
  const remainingUnits = remaining.reduce((a, v) => a + v.est, 0);
  const totalUnits = cur.flat.reduce((a, v) => a + v.est, 0);
  const completedUnits = totalUnits - remainingUnits;

  // --- debt / credit ---
  let expected = 0;
  if (today > S.startDate) {
    for (let k = S.startDate; k < today; k = addDays(k, 1)) expected += capacityFor(k, state);
  }
  const delta = +(loggedUnits - expected).toFixed(2);

  // --- per-day target units across the horizon ---
  const HORIZON = 420;
  const targets = [];
  const keys = [];
  for (let i = 0; i < HORIZON; i++) {
    const k = addDays(today, i);
    keys.push(k);
    targets.push(capacityFor(k, state));
  }

  if (delta < -0.01) {
    // Behind: spread the debt over the catch-up window, weekend-weighted, capped.
    let debt = -delta;
    const W = S.catchUpWindowDays;
    const wsum = targets.slice(0, W).reduce((a, b) => a + b, 0) || 1;
    let spill = 0;
    for (let i = 0; i < W && (debt > 0 || spill > 0); i++) {
      if (targets[i] === 0) continue;
      const want = targets[i] + (debt * targets[i]) / wsum + spill;
      const cap = isWeekend(keys[i]) ? S.maxWeekendUnits : S.maxWeekdayUnits;
      const give = Math.min(want, cap);
      spill = want - give;
      targets[i] = give;
    }
  } else if (delta > 0.01) {
    // Ahead: drain from weekend days first; a weekday never drops below 1.
    let credit = delta;
    for (let i = 0; i < 14 && credit > 0; i++) {
      if (!isWeekend(keys[i]) || targets[i] === 0) continue;
      const take = Math.min(credit, targets[i] - 1);
      targets[i] -= take;
      credit -= take;
    }
  }

  // --- fill days with whole videos, carrying fractional remainder forward ---
  const queue = remaining.slice();
  const plan = [];
  let carry = 0;
  let qi = 0;
  let tail = 0;
  let finishKey = null;

  for (let i = 0; i < HORIZON; i++) {
    const k = keys[i];
    const already = loggedOn[k] || [];
    const alreadyUnits = already.reduce((a, v) => a + v.est, 0);
    const target = Math.max(0, targets[i] + carry - alreadyUnits);
    const vids = [];
    let taken = 0;
    while (qi < queue.length && (taken < target - 0.01 || (taken === 0 && target > 0.01))) {
      vids.push(queue[qi]);
      taken += queue[qi].est;
      qi++;
    }
    carry = targets[i] > 0 ? target - taken : 0;
    if (carry < -2) carry = -2;

    if (vids.length && qi >= queue.length && !finishKey) finishKey = k;

    // Completed videos stay visible on their day so they can be un-checked.
    const shown = already.concat(vids);
    const sketchy = [];
    shown.forEach((v) => v.sketchy.forEach((s) => sketchy.push({ ...s, from: v.title })));

    const ph = phaseFor(k, state, queue.length - qi + vids.length);
    const minutes = shown.reduce((a, v) => a + v.est * S.minPerVideo, 0) + shown.length * 3 * S.minPerQuestion;

    // Pass 1 is earned by completion, not by assignment: 3 questions per video
    // you actually finished. `pass1Planned` is what today becomes if you finish it.
    const isRandom = ph.id === "random";
    const pass1 = isRandom
      ? (isWeekend(k) ? S.randomWeekendQ : S.randomWorkdayQ)
      : already.length * 3;
    const pass1Planned = isRandom ? pass1 : shown.length * 3;

    plan.push({
      key: k,
      isRandom,
      pass1Planned,
      videos: shown,
      rawSketchy: sketchy,
      type: dayType(k, state),
      target: targets[i],
      phase: ph,
      pass1,
      minutes: Math.round(minutes),
    });
    if (qi >= queue.length && i > 0) {
      tail++;
      if (tail > S.randomTailDays) break;
    }
  }

  // --- spread Sketchy overflow forward so one day never carries 11 ---
  let sCarry = [];
  plan.forEach((day) => {
    let pool = sCarry.concat(day.rawSketchy || []);
    sCarry = [];
    if (day.type === "off") {
      sCarry = pool;
      pool = [];
    } else if (pool.length > S.maxSketchyPerDay) {
      sCarry = pool.slice(S.maxSketchyPerDay).map((s) => ({ ...s, carried: true }));
      pool = pool.slice(0, S.maxSketchyPerDay);
    }
    day.sketchy = pool;
    day.minutes = Math.round(day.minutes + pool.length * S.minPerSketchy);
    delete day.rawSketchy;
  });
  const sketchyBacklog = sCarry.length;

  // --- weekend mixed-question blocks ---
  const planByKey = {};
  plan.forEach((d) => (planByKey[d.key] = d));
  const videoDay = {};
  plan.forEach((d) => d.videos.forEach((v) => (videoDay[v.id] = d.key)));

  const dayVideos = (kk) => {
    if (planByKey[kk]) return planByKey[kk].videos;
    const dd = state.days[kk];
    return dd ? (dd.videosDone || []).map((id) => cur.byId[id]).filter(Boolean) : [];
  };

  // The day each section's last video lands — logged, scheduled, or finished before the start.
  const sectionDone = {};
  cur.sections.forEach((sec) => {
    if (!sec.videos.length) return;
    let last = "0000-00-00";
    let complete = true;
    sec.videos.forEach((v) => {
      if (pre.has(v.id)) return;
      const k = doneByDay[v.id] || videoDay[v.id];
      if (!k) { complete = false; return; }
      if (k > last) last = k;
    });
    if (complete) sectionDone[sec.id] = { name: sec.name, qbank: sec.qbank, last, videos: sec.videos };
  });

  const finishedSections = Object.values(sectionDone).sort((a, b) => a.last.localeCompare(b.last));
  const recentSections = [];

  // Pass 2 — every day, from exactly one week back: 2 questions per video studied.
  plan.forEach((day) => {
    if (day.type === "off" || day.isRandom) return;
    const per = S.pass2PerVideo;
    const back = dayVideos(addDays(day.key, -7));
    if (!back.length) return;
    day.pass2 = {
      n: back.length * per,
      per,
      from: addDays(day.key, -7),
      items: back.map((v) => ({
        title: v.title,
        qbank: v.qbank,
        amboss: v.amboss,
      })),
      topics: back.map((v) => v.title),
    };
    back.forEach((v) => recentSections.includes(v.sectionName) || recentSections.push(v.sectionName));
  });

  plan.forEach((day) => {
    if (!isWeekend(day.key) || day.type === "off" || day.isRandom) return;
    const k = day.key;
    const ph = day.phase;

    // Pass 3 — rotate the stalest finished systems so none goes untouched.
    const eligible = Object.values(sectionDone).filter((x) => x.last < k).sort((a, b) => a.last.localeCompare(b.last));
    const picks = [];
    if (eligible.length) {
      const wk = Math.floor(Math.max(0, daysBetween(today, k)) / 7);
      const off = parseKey(k).getDay() === 6 ? 0 : 1;
      const take = Math.min(2, eligible.length);
      for (let j = 0; j < take; j++) {
        const sec = eligible[(wk * 2 + off + j) % eligible.length];
        if (!picks.some((x) => x.name === sec.name)) picks.push(sec);
      }
    }
    day.pass3 = {
      n: Math.round(ph.pass3 / 2),
      sources: picks.map((x) => x.name),
      detail: picks.map((x) => ({
        name: x.name,
        qbank: x.qbank,
        topics: x.videos.slice(0, 3).map((v) => v.title),
      })),
    };
  });

  // --- Sketchy attached to videos finished before the plan started ---
  const strandedSketchy = [];
  cur.flat.forEach((v) => {
    if (!pre.has(v.id)) return;
    v.sketchy.forEach((sk) => strandedSketchy.push({ ...sk, from: v.title, section: v.sectionName }));
  });

  // --- projections ---
  const projectedFinish = finishKey || (plan.length ? plan[plan.length - 1].key : today);
  const weeksToTarget = Math.max(0.2, daysBetween(today, S.targetFinishDate) / 7);
  const requiredWeekly = remainingUnits > 0 ? remainingUnits / weeksToTarget : 0;
  const currentWeekly = S.weekdayVideos * 5 + S.satVideos + S.sunVideos;

  return {
    doneIds, pre, doneByDay, remaining, remainingUnits, totalUnits, completedUnits,
    delta, expected, loggedUnits, plan, projectedFinish, requiredWeekly, currentWeekly, sketchyBacklog, strandedSketchy,
    daysLeft: daysBetween(today, projectedFinish),
    finishedSections, recentSections,
    phase: plan.length ? plan[0].phase : phaseFor(today, state, 0),
  };
}

/* ============================================================
   6. STORAGE
   ============================================================ */

const KEY = "bnb-planner:state:v1";

const DEFAULT_SETTINGS = {
  startDate: dayKey(new Date()),
  targetFinishDate: "2026-12-31",
  paceMode: "fixed",
  weekdayVideos: 1,
  satVideos: 3,
  sunVideos: 3,
  catchUpWindowDays: 7,
  maxWeekdayUnits: 3,
  maxWeekendUnits: 6,
  maxSketchyPerDay: 4,
  pass2PerVideo: 2,
  randomWorkdayQ: 12,
  randomWeekendQ: 25,
  cdmPerWeek: 3,
  randomTailDays: 70,
  dailyMinutesWarn: 90,
  minPerVideo: 18,
  minPerSketchy: 12,
  minPerQuestion: 2,
  phaseOverride: null,
  sectionOrder: SECTIONS.map((s) => s.id),
};

/* Pulmonary, as actually studied. Dated so the 5-7 day lookback that feeds
   Pass 2 has real material to draw on. */
const SEED_LOG = {
  "2026-07-20": ["Asthma"],
  "2026-07-21": ["COPD Diagnosis"],
  "2026-07-22": ["COPD Treatment"],
  "2026-07-23": ["Restrictive Lung Disease"],
  "2026-07-24": ["Pneumonia"],
  "2026-07-25": ["Lung Cancer", "Bronchiectasis", "Shock"],
  "2026-07-26": ["Respiratory Failure", "Sepsis ARDS"],
  "2026-07-27": ["Pulmonary Hypertension"],
  "2026-07-28": ["DVT and Pulmonary Embolism"],
  "2026-07-29": ["Pleural Disease"],
};
const SEED_DAYS = Object.fromEntries(
  Object.entries(SEED_LOG).map(([k, titles]) => [
    k,
    { type: "normal", videosDone: titles.map((t) => vid("pulm", t)) },
  ])
);
const SEED_DATED = new Set(Object.values(SEED_DAYS).flatMap((d) => d.videosDone));

/* Finished, but with no date on record — all of Endocrinology, plus PFTs,
   which predates the log above. These still feed the older-systems rotation. */
const SEED_DONE = []
  .concat(SECTIONS.find((s) => s.id === "endo").videos.map((t) => vid("endo", t)))
  .concat([vid("pulm", "Pulmonary Function Tests")]);

const freshState = () => ({
  version: 3,
  settings: { ...DEFAULT_SETTINGS },
  days: JSON.parse(JSON.stringify(SEED_DAYS)),
  preCompleted: SEED_DONE.slice(),
  extraVideos: {},
});

async function loadState() {
  try {
    const { value } = await Preferences.get({ key: KEY });
    if (!value) return null;
    const parsed = JSON.parse(value);
    parsed.settings = { ...DEFAULT_SETTINGS, ...parsed.settings };
    parsed.days = parsed.days || {};
    parsed.preCompleted = parsed.preCompleted || [];
    parsed.extraVideos = parsed.extraVideos || {};
    if (!parsed.version || parsed.version < 3) {
      // Pulmonary was previously seeded undated; move it onto real dates.
      parsed.preCompleted = Array.from(
        new Set(parsed.preCompleted.filter((id) => !SEED_DATED.has(id)).concat(SEED_DONE))
      );
      Object.keys(SEED_DAYS).forEach((k) => {
        if (!parsed.days[k]) parsed.days[k] = JSON.parse(JSON.stringify(SEED_DAYS[k]));
      });
      parsed.version = 3;
    }
    return parsed;
  } catch (e) {
    return null;
  }
}

async function saveState(s) {
  try {
    await Preferences.set({ key: KEY, value: JSON.stringify(s) });
    return true;
  } catch (e) {
    return false;
  }
}

/* ============================================================
   7. UI PRIMITIVES
   ============================================================ */

function Check({ on, onClick, children, dim, sub }) {
  return (
    <button
      onClick={onClick}
      className={
        "w-full flex items-start gap-3 text-left py-3 px-3 rounded border transition-colors " +
        (on
          ? "border-emerald-800 bg-emerald-950"
          : dim
          ? "border-slate-800 bg-slate-900 opacity-60"
          : "border-slate-800 bg-slate-900 hover:border-slate-700")
      }
    >
      <span
        className={
          "mt-0.5 shrink-0 w-5 h-5 rounded-sm border flex items-center justify-center text-xs font-bold " +
          (on ? "border-emerald-500 bg-emerald-500 text-emerald-950" : "border-slate-600 text-transparent")
        }
      >
        ✓
      </span>
      <span className="min-w-0 flex-1">
        <span className={"block text-sm leading-snug " + (on ? "text-emerald-200 line-through" : "text-slate-100")}>
          {children}
        </span>
        {sub ? <span className="block text-xs text-slate-500 mt-1 leading-snug">{sub}</span> : null}
      </span>
    </button>
  );
}

function Stat({ label, value, tone }) {
  const c = tone === "warn" ? "text-amber-300" : tone === "good" ? "text-emerald-300" : "text-cyan-300";
  return (
    <div className="px-3 py-2 border-r border-slate-800 last:border-r-0">
      <div className="uppercase tracking-widest text-slate-500 text-xs">{label}</div>
      <div className={"font-mono text-lg leading-tight " + c}>{value}</div>
    </div>
  );
}

function Bar({ pct, tone }) {
  const c = tone === "warn" ? "bg-amber-400" : tone === "good" ? "bg-emerald-500" : "bg-cyan-400";
  return (
    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
      <div className={"h-full " + c} style={{ width: Math.max(0, Math.min(100, pct)) + "%" }} />
    </div>
  );
}

function Tag({ children, tone }) {
  const c =
    tone === "micro" ? "border-sky-800 text-sky-300"
    : tone === "pharm" ? "border-violet-800 text-violet-300"
    : tone === "path" ? "border-teal-800 text-teal-300"
    : "border-slate-700 text-slate-400";
  return <span className={"px-1.5 py-0.5 rounded border text-xs font-mono uppercase " + c}>{children}</span>;
}

function Field({ label, children }) {
  return (
    <label className="block mb-3">
      <span className="block text-xs uppercase tracking-wider text-slate-500 mb-1">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-100 font-mono focus:border-cyan-500 focus:outline-none";

/* ============================================================
   8. TODAY
   ============================================================ */

function TodayView({ cur, state, en, today, update }) {
  const nextUp = en.remaining[0];
  const day = en.plan.find((d) => d.key === today) || en.plan[0];
  const log = state.days[today] || {};
  const doneV = new Set(log.videosDone || []);
  const doneS = new Set(log.sketchyDone || []);
  const S = state.settings;
  if (!day) return <Empty />;

  const setDay = (patch) =>
    update((s) => {
      s.days[today] = { ...(s.days[today] || { type: "normal" }), ...patch };
    });

  const toggleV = (id) =>
    update((s) => {
      const d = (s.days[today] = s.days[today] || { type: "normal", videosDone: [] });
      d.videosDone = d.videosDone || [];
      d.videosDone = d.videosDone.includes(id) ? d.videosDone.filter((x) => x !== id) : d.videosDone.concat(id);
    });

  const toggleS = (k) =>
    update((s) => {
      const d = (s.days[today] = s.days[today] || { type: "normal" });
      d.sketchyDone = d.sketchyDone || [];
      d.sketchyDone = d.sketchyDone.includes(k) ? d.sketchyDone.filter((x) => x !== k) : d.sketchyDone.concat(k);
    });

  const off = (log.type || "normal") === "off";
  const articles = [];
  day.videos.forEach((v) => v.amboss.forEach((a) => articles.includes(a) || articles.push(a)));
  const qbanks = [];
  day.videos.forEach((v) => qbanks.includes(v.qbank) || qbanks.push(v.qbank));
  const shownVideos = day.videos;

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between border-b border-slate-800 pb-2">
        <div>
          <div className="font-mono text-sm text-slate-400 uppercase tracking-widest">{fmtLong(today)}</div>
          <div className="text-xs text-slate-600 mt-0.5">
            {day.phase.label} phase{day.minutes > S.dailyMinutesWarn ? " · heavy day" : ""}
          </div>
        </div>
        <div className="font-mono text-sm text-slate-500">{off ? "—" : day.minutes + " min"}</div>
      </div>

      {off ? (
        <div className="rounded border border-slate-800 bg-slate-900 p-4 text-sm text-slate-400">
          Day off. Today's work is already spread across the next {S.catchUpWindowDays} days.
        </div>
      ) : (
        <>
          <Block label="Morning" note="5:30–6:10">
            {shownVideos.length === 0 ? (
              <div className="text-sm text-slate-500 px-3 py-3">Nothing queued — the video list is finished.</div>
            ) : (
              shownVideos.map((v) => (
                <Check key={v.id} on={doneV.has(v.id)} onClick={() => toggleV(v.id)} sub={v.sectionName}>
                  {v.title}
                  {v.est !== 1 ? <span className="text-slate-500 font-mono text-xs"> · {v.est}u</span> : null}
                </Check>
              ))
            )}
            {nextUp ? (
              <button
                onClick={() => toggleV(nextUp.id)}
                className="w-full text-left rounded border border-dashed border-slate-700 px-3 py-2.5 text-sm text-slate-400 hover:border-cyan-700 hover:text-cyan-300"
              >
                <span className="font-mono text-xs text-slate-600 mr-2">+</span>
                Watched an extra one — log <span className="text-slate-300">{nextUp.title}</span>
              </button>
            ) : null}
            {day.sketchy.map((s, i) => {
                const k = s.s + ":" + s.t;
                return (
                  <Check key={k + i} on={doneS.has(k)} onClick={() => toggleS(k)} sub={s.carried ? "carried from " + s.from : "with " + s.from}>
                    <span className="inline-flex items-center gap-2">
                      <Tag tone={s.s}>{s.s}</Tag>
                      {s.t}
                    </span>
                  </Check>
                );
              })}
          </Block>

          <Block
            label={day.isRandom ? "Random questions" : "Questions"}
            note={day.isRandom ? day.pass1 + " today" : "3 per video completed"}
          >
            <div className="rounded border border-slate-800 bg-slate-900 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-2xl text-cyan-300">{log.questionsDone || 0}</span>
                <span className="font-mono text-xs text-slate-500">of {day.pass1}</span>
              </div>
              <Bar pct={((log.questionsDone || 0) / Math.max(1, day.pass1)) * 100} />
              {!day.isRandom && day.pass1Planned > day.pass1 ? (
                <div className="text-xs text-slate-500 mt-2">
                  {day.pass1 === 0 ? "Nothing owed yet — " : ""}
                  rises to {day.pass1Planned} once today's {day.videos.length === 1 ? "video is" : "videos are"} done
                </div>
              ) : null}
              <div className="flex gap-2 mt-3">
                {[1, 3, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setDay({ questionsDone: (log.questionsDone || 0) + n })}
                    className="flex-1 py-2 rounded border border-slate-700 text-sm text-slate-300 hover:border-cyan-600 font-mono"
                  >
                    +{n}
                  </button>
                ))}
                <button
                  onClick={() => setDay({ questionsDone: 0 })}
                  className="px-3 py-2 rounded border border-slate-800 text-xs text-slate-500 hover:border-slate-600"
                >
                  reset
                </button>
              </div>
              {qbanks.length ? (
                <div className="mt-3 pt-3 border-t border-slate-800">
                  <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">AMBOSS session</div>
                  {qbanks.map((q) => (
                    <div key={q} className="text-sm text-slate-300 font-mono">{q}</div>
                  ))}
                  <div className="text-xs uppercase tracking-wider text-slate-500 mt-3 mb-1">Read first</div>
                  <div className="text-sm text-slate-300 leading-relaxed">{articles.join(" · ")}</div>
                </div>
              ) : null}
            </div>
          </Block>

          {day.pass2 && day.pass2.n ? (
            <Block label="Recent mixed" note={day.pass2.n + " questions"}>
              <div className="text-xs text-slate-600 mb-2 font-mono">
                from {fmtLong(day.pass2.from)} — one week back
              </div>
              {day.pass2.items.map((it) => (
                <div key={it.title} className="rounded border border-slate-800 bg-slate-900 p-3">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-sm text-slate-200">{it.title}</span>
                    <span className="font-mono text-xs text-cyan-300">{day.pass2.per} Q</span>
                  </div>
                  <div className="text-sm text-slate-400 font-mono">{it.qbank}</div>
                  <div className="text-xs uppercase tracking-wider text-slate-500 mt-2 mb-1">Articles</div>
                  <div className="text-sm text-slate-300 leading-relaxed">{it.amboss.join(" · ")}</div>
                </div>
              ))}
            </Block>
          ) : null}

          {day.pass3 && day.pass3.n && day.pass3.detail.length ? (
            <Block label="Older systems" note={day.pass3.n + " questions"}>
              {day.pass3.detail.map((x) => (
                <div key={x.name} className="rounded border border-slate-800 bg-slate-900 p-3">
                  <div className="text-sm text-slate-200 mb-1">{x.name}</div>
                  <div className="text-sm text-slate-300 font-mono">{x.qbank}</div>
                  <div className="text-xs text-slate-500 mt-2 leading-relaxed">
                    random across the system — e.g. {x.topics.join(", ")}
                  </div>
                </div>
              ))}
            </Block>
          ) : null}

        </>
      )}

      {!off && day.isRandom ? (
        <Block label="COMLEX CDM" note={S.cdmPerWeek + "x per week"}>
          <Check on={!!log.cdmDone} onClick={() => setDay({ cdmDone: !log.cdmDone })}>
            CDM cases
          </Check>
        </Block>
      ) : null}

      <div className="pt-2">
        <button
          onClick={() => setDay({ type: off ? "normal" : "off" })}
          className={
            "w-full py-3 rounded border text-sm " +
            (off ? "border-slate-600 bg-slate-800 text-slate-200" : "border-slate-700 text-slate-300 hover:border-slate-600")
          }
        >
          {off ? "day off ✓" : "took a day off"}
        </button>
      </div>
    </div>
  );
}

function Block({ label, note, children }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs uppercase tracking-widest text-slate-500">{label}</span>
        <span className="text-xs text-slate-600 font-mono">{note}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Empty() {
  return <div className="text-sm text-slate-500 py-8 text-center">Nothing scheduled.</div>;
}

/* ============================================================
   9. WEEK
   ============================================================ */

function WeekView({ state, en, today, update, setTab }) {
  const [offset, setOffset] = useState(0);
  const start = addDays(today, offset * 7 - ((parseKey(today).getDay() + 6) % 7));
  const week = [];
  for (let i = 0; i < 7; i++) week.push(addDays(start, i));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <button onClick={() => setOffset(offset - 1)} className="px-3 py-1 text-slate-400 hover:text-cyan-300 font-mono">
          ←
        </button>
        <span className="font-mono text-sm text-slate-400">
          {fmtShort(week[0])} – {fmtShort(week[6])}
        </span>
        <button onClick={() => setOffset(offset + 1)} className="px-3 py-1 text-slate-400 hover:text-cyan-300 font-mono">
          →
        </button>
      </div>

      {week.map((k) => {
        const day = en.plan.find((d) => d.key === k);
        const log = state.days[k] || {};
        const isToday = k === today;
        const past = k < today;
        const doneN = (log.videosDone || []).length;
        const planned = day ? day.videos.length : 0;
        const type = log.type || "normal";

        return (
          <div
            key={k}
            className={
              "rounded border p-3 " +
              (isToday ? "border-cyan-700 bg-slate-900" : past ? "border-slate-800 bg-slate-950" : "border-slate-800 bg-slate-900")
            }
          >
            <div className="flex items-baseline justify-between mb-2">
              <span className={"font-mono text-sm " + (isToday ? "text-cyan-300" : "text-slate-400")}>
                {fmtLong(k)}
                {isToday ? " ·  today" : ""}
              </span>
              <span className="font-mono text-xs text-slate-600">
                {type === "off" ? "off" : day ? day.minutes + "m" : "—"}
              </span>
            </div>

            {past || isToday ? (
              <div className="mb-2">
                <Bar pct={planned ? (doneN / planned) * 100 : doneN ? 100 : 0} tone={doneN >= planned && planned ? "good" : undefined} />
              </div>
            ) : null}

            {day && day.videos.length ? (
              <div className="space-y-1">
                {day.videos.map((v) => (
                  <div key={v.id} className="flex items-start gap-2 text-sm">
                    <button
                      onClick={() =>
                        update((s) => {
                          const d = (s.days[k] = s.days[k] || { type: "normal" });
                          d.videosDone = d.videosDone || [];
                          d.videosDone = d.videosDone.includes(v.id)
                            ? d.videosDone.filter((x) => x !== v.id)
                            : d.videosDone.concat(v.id);
                        })
                      }
                      className={
                        "mt-0.5 shrink-0 w-4 h-4 rounded-sm border text-xs leading-none flex items-center justify-center " +
                        ((log.videosDone || []).includes(v.id)
                          ? "border-emerald-500 bg-emerald-500 text-emerald-950"
                          : "border-slate-600 text-transparent hover:border-slate-500")
                      }
                    >
                      ✓
                    </button>
                    <span className={(log.videosDone || []).includes(v.id) ? "text-slate-600 line-through" : "text-slate-200"}>
                      {v.title}
                    </span>
                  </div>
                ))}
                {day.sketchy.length ? (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {day.sketchy.map((s, i) => (
                      <span key={i} className="text-xs text-slate-500 font-mono">
                        [{s.s}] {s.t}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="text-sm text-slate-600">{type === "off" ? "Day off" : "—"}</div>
            )}

            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 pt-2 border-t border-slate-800 text-xs font-mono text-slate-500">
              <span>{day ? (day.isRandom ? day.pass1 + " random Q" : day.pass1Planned + " targeted Q") : "0 Q"}</span>
              {day && day.pass2 && day.pass2.n ? <span>+{day.pass2.n} recent</span> : null}
              {day && day.pass3 && day.pass3.n ? <span>+{day.pass3.n} older systems</span> : null}
            </div>
            {day && day.pass2 && day.pass2.n ? (
              <div className="text-xs text-slate-600 mt-1">recent: {day.pass2.topics.join(", ")}</div>
            ) : null}
            {day && day.pass3 && day.pass3.sources.length ? (
              <div className="text-xs text-slate-600 mt-1">older: {day.pass3.sources.join(", ")}</div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
   10. PROGRESS
   ============================================================ */

function Burndown({ cur, state, en, today }) {
  const W = 320, H = 120, PAD = 4;
  const total = en.totalUnits;
  const startK = state.settings.startDate;
  const endK = en.projectedFinish;
  const span = Math.max(1, daysBetween(startK, endK));

  // actual: cumulative completed by day
  const byDay = {};
  Object.keys(state.days).forEach((k) => {
    const n = (state.days[k].videosDone || []).reduce((a, id) => a + (cur.byId[id] ? cur.byId[id].est : 0), 0);
    if (n) byDay[k] = (byDay[k] || 0) + n;
  });
  const preUnits = (state.preCompleted || []).reduce((a, id) => a + (cur.byId[id] ? cur.byId[id].est : 0), 0);

  const pts = [];
  let acc = preUnits;
  const upto = today > startK ? daysBetween(startK, today) : 0;
  for (let i = 0; i <= upto; i++) {
    const k = addDays(startK, i);
    acc += byDay[k] || 0;
    pts.push([i, total - acc]);
  }
  const x = (i) => PAD + (i / span) * (W - PAD * 2);
  const y = (v) => PAD + (1 - v / total) * (H - PAD * 2);

  const actual = pts.map((p) => x(p[0]) + "," + y(p[1])).join(" ");
  const idealEnd = daysBetween(startK, state.settings.targetFinishDate);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-32">
      <line x1={x(0)} y1={y(total)} x2={x(idealEnd)} y2={y(0)} stroke="rgb(51,65,85)" strokeWidth="1" strokeDasharray="3 3" />
      {pts.length > 1 ? (
        <>
          <polyline points={actual} fill="none" stroke="rgb(103,232,249)" strokeWidth="2" />
          <line
            x1={x(upto)} y1={y(pts[pts.length - 1][1])}
            x2={x(span)} y2={y(0)}
            stroke="rgb(103,232,249)" strokeWidth="1" strokeDasharray="2 4" opacity="0.5"
          />
        </>
      ) : null}
      <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="rgb(30,41,59)" strokeWidth="1" />
    </svg>
  );
}

function ProgressView({ cur, state, en, today }) {
  const S = state.settings;
  const wkStart = addDays(today, -((parseKey(today).getDay() + 6) % 7));
  let wkV = 0, wkQ = 0, wkCDM = 0;
  for (let i = 0; i < 7; i++) {
    const d = state.days[addDays(wkStart, i)];
    if (!d) continue;
    wkV += (d.videosDone || []).length;
    wkQ += d.questionsDone || 0;
    if (d.cdmDone) wkCDM += 1;
  }
  const ph = en.phase;
  const isRandom = ph.id === "random";
  const p1 = wkV * 3;
  // Pass 2 this week = 2 questions per video studied the week before.
  let prevV = 0;
  for (let i = 0; i < 7; i++) {
    const d = state.days[addDays(wkStart, i - 7)];
    if (d) prevV += (d.videosDone || []).length;
  }
  const p2 = prevV * state.settings.pass2PerVideo;
  const qLo = isRandom ? 70 : p1 + p2 + ph.p3[0];
  const qHi = isRandom ? 100 : p1 + p2 + ph.p3[1];
  const qBreak = isRandom
    ? "random across every completed system"
    : p1 + " targeted (" + wkV + " video" + (wkV === 1 ? "" : "s") + " done) + " +
      p2 + " recent (" + prevV + " last week) + " + ph.p3[0] + "\u2013" + ph.p3[1] + " older";

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Burndown</div>
        <div className="rounded border border-slate-800 bg-slate-900 p-2">
          <Burndown cur={cur} state={state} en={en} today={today} />
          <div className="flex justify-between text-xs font-mono text-slate-600 px-1">
            <span>{fmtShort(S.startDate)}</span>
            <span className="text-slate-500">dashed = target pace</span>
            <span>{fmtShort(en.projectedFinish)}</span>
          </div>
        </div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">This week</div>
        <div className="rounded border border-slate-800 bg-slate-900 divide-y divide-slate-800">
          {isRandom ? null : <ScoreRow label="B&B videos" v={wkV} goal={11} />}
          <div className="p-3">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-sm text-slate-300">Questions</span>
              <span className="font-mono text-sm">
                <span className={wkQ >= qLo ? "text-emerald-300" : "text-cyan-300"}>{wkQ}</span>
                <span className="text-slate-600"> / {qLo}&ndash;{qHi}</span>
              </span>
            </div>
            <Bar pct={qHi ? (wkQ / qHi) * 100 : 0} tone={wkQ >= qLo ? "good" : undefined} />
            <div className="text-xs text-slate-500 mt-2 leading-relaxed">{qBreak}</div>
          </div>
          {isRandom ? <ScoreRow label="CDM case days" v={wkCDM} goal={state.settings.cdmPerWeek} /> : null}
        </div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Sections</div>
        <div className="space-y-2">
          {cur.sections.map((s) => {
            const n = s.videos.filter((v) => en.doneIds.has(v.id) || en.pre.has(v.id)).length;
            const pct = s.videos.length ? (n / s.videos.length) * 100 : 0;
            return (
              <div key={s.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className={n === s.videos.length && s.videos.length ? "text-emerald-300" : "text-slate-300"}>
                    {s.name}
                  </span>
                  <span className="font-mono text-xs text-slate-500">
                    {s.videos.length === 0 ? "no videos yet" : n + "/" + s.videos.length}
                  </span>
                </div>
                <Bar pct={pct} tone={pct === 100 ? "good" : undefined} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ScoreRow({ label, v, goal }) {
  const pct = (v / goal) * 100;
  return (
    <div className="p-3">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-sm text-slate-300">{label}</span>
        <span className="font-mono text-sm">
          <span className={pct >= 90 ? "text-emerald-300" : "text-cyan-300"}>{v}</span>
          <span className="text-slate-600"> / {goal}</span>
        </span>
      </div>
      <Bar pct={pct} tone={pct >= 90 ? "good" : undefined} />
    </div>
  );
}

/* ============================================================
   11. SETUP
   ============================================================ */

function SetupView({ cur, state, en, update, reload }) {
  const S = state.settings;
  const [addTo, setAddTo] = useState("endo");
  const [addText, setAddText] = useState("");
  const [openSec, setOpenSec] = useState(null);
  const [io, setIo] = useState("");

  const set = (k, v) => update((s) => { s.settings[k] = v; });

  const addVideos = () => {
    const lines = addText.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return;
    update((s) => {
      s.extraVideos[addTo] = (s.extraVideos[addTo] || []).concat(lines);
    });
    setAddText("");
  };

  const move = (id, dir) =>
    update((s) => {
      const o = s.settings.sectionOrder.slice();
      const i = o.indexOf(id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= o.length) return;
      [o[i], o[j]] = [o[j], o[i]];
      s.settings.sectionOrder = o;
    });

  return (
    <div className="space-y-6">
      <Group title="Dates & pace">
        <Field label="Start date"><input type="date" value={S.startDate} onChange={(e) => set("startDate", e.target.value)} className={inputCls} /></Field>
        <Field label="Target finish for videos"><input type="date" value={S.targetFinishDate} onChange={(e) => set("targetFinishDate", e.target.value)} className={inputCls} /></Field>
        <div className="grid grid-cols-3 gap-2">
          <Field label="Weekday"><input type="number" step="1" value={S.weekdayVideos} onChange={(e) => set("weekdayVideos", +e.target.value)} className={inputCls} /></Field>
          <Field label="Saturday"><input type="number" step="1" value={S.satVideos} onChange={(e) => set("satVideos", +e.target.value)} className={inputCls} /></Field>
          <Field label="Sunday"><input type="number" step="1" value={S.sunVideos} onChange={(e) => set("sunVideos", +e.target.value)} className={inputCls} /></Field>
        </div>
        <div className="rounded border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-400 leading-relaxed">
          {S.weekdayVideos * 5 + S.satVideos + S.sunVideos}/week finishes {fmtFinish(en.projectedFinish)}
          <br />
          hitting {fmtFinish(S.targetFinishDate)} needs{" "}
          <span className="text-cyan-300">{en.requiredWeekly.toFixed(1)}</span>/week
        </div>
      </Group>

      <Group title="Daily load">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Max Sketchy/day"><input type="number" value={S.maxSketchyPerDay} onChange={(e) => set("maxSketchyPerDay", +e.target.value)} className={inputCls} /></Field>
          <Field label="Catch-up window (days)"><input type="number" value={S.catchUpWindowDays} onChange={(e) => set("catchUpWindowDays", +e.target.value)} className={inputCls} /></Field>
          <Field label="Max weekday videos"><input type="number" value={S.maxWeekdayUnits} onChange={(e) => set("maxWeekdayUnits", +e.target.value)} className={inputCls} /></Field>
          <Field label="Heavy-day warning (min)"><input type="number" value={S.dailyMinutesWarn} onChange={(e) => set("dailyMinutesWarn", +e.target.value)} className={inputCls} /></Field>
        </div>
      </Group>

      <Group title="Add videos">
        <p className="text-xs text-slate-500 mb-3 leading-relaxed">
          Paste titles one per line to append them to a section, in order.
        </p>
        <Field label="Section">
          <select value={addTo} onChange={(e) => setAddTo(e.target.value)} className={inputCls}>
            {cur.sections.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </Field>
        <textarea
          value={addText}
          onChange={(e) => setAddText(e.target.value)}
          rows={5}
          placeholder={"Diabetes Mellitus\nDiabetes Complications\nHyperthyroidism\nHypothyroidism"}
          className={inputCls + " resize-y"}
        />
        <button onClick={addVideos} className="mt-2 w-full py-2 rounded border border-cyan-800 bg-cyan-950 text-cyan-200 text-sm hover:border-cyan-600">
          Add to {(cur.sections.find((s) => s.id === addTo) || {}).name}
        </button>
      </Group>

      <Group title="Section order">
        <p className="text-xs text-slate-500 mb-3">Currently rotation-aligned. Reorder as rotations shift.</p>
        <div className="space-y-1">
          {cur.sections.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 rounded border border-slate-800 bg-slate-900 px-2 py-1.5">
              <span className="font-mono text-xs text-slate-600 w-6">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex-1 text-sm text-slate-300">{s.name}</span>
              <span className="font-mono text-xs text-slate-600">{s.videos.length}</span>
              <button onClick={() => move(s.id, -1)} className="px-2 text-slate-500 hover:text-cyan-300">↑</button>
              <button onClick={() => move(s.id, 1)} className="px-2 text-slate-500 hover:text-cyan-300">↓</button>
            </div>
          ))}
        </div>
      </Group>

      <Group title="Mark what's already done">
        <p className="text-xs text-slate-500 mb-3 leading-relaxed">
          Videos checked here count as finished but don't count toward your pace — use this for anything completed before the start date.
        </p>
        <div className="space-y-1">
          {cur.sections.filter((s) => s.videos.length).map((s) => {
            const open = openSec === s.id;
            const n = s.videos.filter((v) => (state.preCompleted || []).includes(v.id)).length;
            return (
              <div key={s.id} className="rounded border border-slate-800 bg-slate-900">
                <button onClick={() => setOpenSec(open ? null : s.id)} className="w-full flex items-center gap-2 px-3 py-2 text-left">
                  <span className="flex-1 text-sm text-slate-300">{s.name}</span>
                  <span className="font-mono text-xs text-slate-600">{n}/{s.videos.length}</span>
                  <span className="text-slate-600">{open ? "−" : "+"}</span>
                </button>
                {open ? (
                  <div className="px-3 pb-3 space-y-1 border-t border-slate-800 pt-2">
                    <button
                      onClick={() => update((st2) => {
                        const ids = s.videos.map((v) => v.id);
                        const all = ids.every((id) => (st2.preCompleted || []).includes(id));
                        st2.preCompleted = all
                          ? (st2.preCompleted || []).filter((id) => !ids.includes(id))
                          : Array.from(new Set((st2.preCompleted || []).concat(ids)));
                      })}
                      className="text-xs text-cyan-400 hover:text-cyan-300 mb-1"
                    >
                      {n === s.videos.length ? "clear this whole section" : "mark whole section done"}
                    </button>
                    {s.videos.map((v) => {
                      const on = (state.preCompleted || []).includes(v.id);
                      return (
                        <div key={v.id} className="flex items-center gap-2">
                          <button
                            onClick={() => update((st2) => {
                              const p = new Set(st2.preCompleted || []);
                              p.has(v.id) ? p.delete(v.id) : p.add(v.id);
                              st2.preCompleted = Array.from(p);
                            })}
                            className={"w-4 h-4 shrink-0 rounded-sm border text-xs leading-none flex items-center justify-center " +
                              (on ? "border-emerald-500 bg-emerald-500 text-emerald-950" : "border-slate-600 text-transparent")}
                          >✓</button>
                          <span className={"flex-1 text-sm " + (on ? "text-slate-600 line-through" : "text-slate-300")}>{v.title}</span>
                          <button
                            onClick={() => update((st2) => {
                              const idx = cur.flat.findIndex((x) => x.id === v.id);
                              const upto = cur.flat.slice(0, idx + 1).map((x) => x.id);
                              st2.preCompleted = Array.from(new Set((st2.preCompleted || []).concat(upto)));
                            })}
                            className="text-xs text-slate-600 hover:text-cyan-300 shrink-0"
                            title="mark this and everything before it as done"
                          >through here</button>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </Group>

      <Group title="Backup">
        <button
          onClick={() => setIo(JSON.stringify(state))}
          className="w-full py-2 mb-2 rounded border border-slate-700 text-sm text-slate-300 hover:border-slate-600"
        >
          Export to the box below
        </button>
        <textarea value={io} onChange={(e) => setIo(e.target.value)} rows={3} placeholder="paste a backup here to restore" className={inputCls + " resize-y"} />
        <button
          onClick={() => { try { const p = JSON.parse(io); if (p && p.settings) reload(p); } catch (e) { setIo("that wasn't valid backup text"); } }}
          className="mt-2 w-full py-2 rounded border border-slate-700 text-sm text-slate-300 hover:border-slate-600"
        >
          Restore from the box
        </button>
        <button
          onClick={() => { if (confirm("Erase all logged progress?")) reload(freshState()); }}
          className="mt-4 w-full py-2 rounded border border-slate-800 text-sm text-slate-600 hover:border-slate-700"
        >
          Reset everything
        </button>
      </Group>
    </div>
  );
}

function Group({ title, children }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-slate-500 mb-2 pb-1 border-b border-slate-800">{title}</div>
      {children}
    </div>
  );
}

/* ============================================================
   12. ROOT
   ============================================================ */

export default function StudyPlanner() {
  const [state, setState] = useState(null);
  const [tab, setTab] = useState("today");
  const [loading, setLoading] = useState(true);
  const [saveNote, setSaveNote] = useState("");
  const timer = useRef(null);
  const today = dayKey(new Date());

  useEffect(() => {
    let live = true;
    (async () => {
      const s = await loadState();
      if (!live) return;
      setState(s || freshState());
      setLoading(false);
    })();
    return () => { live = false; };
  }, []);

  useEffect(() => {
    if (!state) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const ok = await saveState(state);
      if (!ok) setSaveNote("Not saving — export a backup from Setup before you close this.");
    }, 500);
    return () => timer.current && clearTimeout(timer.current);
  }, [state]);

  const update = (fn) =>
    setState((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      fn(next);
      return next;
    });

  const cur = useMemo(() => (state ? buildCurriculum(state) : null), [state]);
  const en = useMemo(() => (state && cur ? computeEngine(cur, state, today) : null), [state, cur, today]);

  if (loading || !state || !en) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-500 flex items-center justify-center font-mono text-sm">
        loading…
      </div>
    );
  }

  const behind = en.delta < -0.01;
  const ahead = en.delta > 0.01;
  const gapSections = cur.sections.filter((s) => s.videos.length === 0);
  const pace = state.settings.weekdayVideos * 5 + state.settings.satVideos + state.settings.sunVideos;

  const TABS = [
    ["today", "Today"],
    ["week", "Week"],
    ["progress", "Progress"],
    ["setup", "Setup"],
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-lg mx-auto px-4 py-5">
        <div className="flex items-baseline justify-between mb-3">
          <h1 className="font-mono text-sm uppercase tracking-widest text-slate-300">Board Plan</h1>
          <span className="font-mono text-xs text-slate-600">COMLEX L3 · Feb 2027</span>
        </div>

        <div className="grid grid-cols-4 rounded border border-slate-800 bg-slate-900 mb-3">
          <Stat label="videos" value={en.remaining.length} />
          <Stat label="days" value={en.daysLeft} />
          <Stat label="per wk" value={en.requiredWeekly.toFixed(1)} tone={en.requiredWeekly > pace + 0.5 ? "warn" : "good"} />
          <Stat label="finish" value={fmtShort(en.projectedFinish)} />
        </div>

        {behind || ahead ? (
          <div
            className={
              "rounded border px-3 py-2 mb-3 text-sm " +
              (behind ? "border-slate-700 bg-slate-900 text-slate-300" : "border-emerald-900 bg-emerald-950 text-emerald-200")
            }
          >
            {behind
              ? `${Math.abs(en.delta)} video${Math.abs(en.delta) === 1 ? "" : "s"} behind — spread across the next ${state.settings.catchUpWindowDays} days.`
              : `${en.delta} video${en.delta === 1 ? "" : "s"} ahead — the coming weekend is lighter.`}
          </div>
        ) : null}

        {saveNote ? (
          <div className="rounded border border-amber-800 bg-amber-950 px-3 py-2 mb-3 text-sm text-amber-200">{saveNote}</div>
        ) : null}

        {gapSections.length && tab !== "setup" ? (
          <button
            onClick={() => setTab("setup")}
            className="w-full text-left rounded border border-slate-800 bg-slate-900 px-3 py-2 mb-3 text-sm text-slate-400 hover:border-slate-700"
          >
            {gapSections.map((s) => s.name).join(" and ")} {gapSections.length === 1 ? "has" : "have"} no videos yet — add them in Setup →
          </button>
        ) : null}

        <div className="flex gap-1 mb-4 border-b border-slate-800">
          {TABS.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={
                "px-3 py-2 text-sm border-b-2 -mb-px transition-colors " +
                (tab === id ? "border-cyan-400 text-cyan-300" : "border-transparent text-slate-500 hover:text-slate-300")
              }
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "today" ? <TodayView cur={cur} state={state} en={en} today={today} update={update} /> : null}
        {tab === "week" ? <WeekView state={state} en={en} today={today} update={update} setTab={setTab} /> : null}
        {tab === "progress" ? <ProgressView cur={cur} state={state} en={en} today={today} /> : null}
        {tab === "setup" ? (
          <SetupView cur={cur} state={state} en={en} update={update} reload={(s) => setState(s)} />
        ) : null}

        {tab === "setup" ? (
          <div className="mt-6 rounded border border-slate-800 bg-slate-900 p-3">
            <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Sketchy that never gets scheduled</div>
            {SKETCHY_ORPHANS.map((o) => (
              <div key={o.t} className="text-sm text-slate-400 mb-2">
                <span className="font-mono text-xs text-teal-400">[{o.s}]</span> {o.t}
                <span className="block text-xs text-slate-600">{o.why}</span>
              </div>
            ))}
            {en.strandedSketchy.map((o, i) => (
              <div key={o.t + i} className="text-sm text-slate-400 mb-2">
                <span className={"font-mono text-xs " + (o.s === "pharm" ? "text-violet-400" : o.s === "micro" ? "text-sky-400" : "text-teal-400")}>[{o.s}]</span> {o.t}
                <span className="block text-xs text-slate-600">pairs with {o.from} — {o.section} is already done</span>
              </div>
            ))}
            {!SKETCHY_ORPHANS.length && !en.strandedSketchy.length ? (
              <div className="text-sm text-slate-600">Everything has a home.</div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-8 pt-4 border-t border-slate-800 font-mono text-xs text-slate-700 text-center">
          {en.completedUnits.toFixed(0)} / {en.totalUnits.toFixed(0)} units · {en.phase.label}
        </div>
      </div>
    </div>
  );
}
