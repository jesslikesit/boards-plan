import { useState, useEffect, useMemo, useRef } from "react";

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
  { id: "cards", name: "Cardiology", qbank: "Cardiovascular system", videos: [
    "EKG Interpretation", "ACLS and Tachycardias", "Atrial Fibrillation and Flutter", "Bradycardia",
    "Coronary Artery Disease", "STEMI", "Heart Failure I", "Heart Failure II", "Cardiomyopathy",
    "Heart Murmurs", "Heart Sounds", "Cardiovascular Pharmacology I", "Cardiovascular Pharmacology II",
    "Pericardial Disease", "Valvular Heart Disease", "Hyperlipidemia", "Hypertension",
    "Peripheral Vascular Disease", "Aortic Disease",
  ]},
  { id: "id", name: "Infectious Disease", qbank: "Infectious diseases", videos: [
    "Penicillins", "Beta Lactams", "Protein Synthesis Inhibitors", "Other Antibiotics",
    "Fungal Infections", "Antifungal Drugs", "Protozoal Infections", "Malaria", "HIV Infection",
    "HIV Drugs", "HIV Complications", "Tick-borne Illnesses", "Sexually-transmitted Infections",
    "Meningitis", "Tuberculosis", "Adult Vaccinations",
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

/* High-yield videos for Level 3, by priority area. Titles must match SECTIONS
   exactly — validated at build time by scripts/check-high-yield. */
const HIGH_YIELD = {
  epi: ["Study Designs", "Risk Quantification", "Sensitivity and Specificity", "Predictive Values",
        "Diagnostic Tests", "Bias", "Clinical Trials", "Evidence Based Medicine"],
  behav: ["Informed Consent", "Decision-Making Capacity", "Confidentiality", "Quality", "Safety", "Public Health"],
  cards: ["ACLS and Tachycardias", "Atrial Fibrillation and Flutter", "Bradycardia", "STEMI",
          "Heart Failure I", "Heart Failure II", "Hypertension", "Valvular Heart Disease",
          "Aortic Disease", "Hyperlipidemia"],
  pulm: ["Shock", "Respiratory Failure", "Sepsis ARDS", "DVT and Pulmonary Embolism",
         "Asthma", "COPD Treatment", "Pneumonia"],
  neuro: ["Stroke I", "Stroke II", "Intracranial Bleeding", "Seizures", "Seizure Treatment",
          "Altered Mental Status", "Syncope", "Headache"],
  renal: ["Acute Renal Failure", "Fluids", "Hyponatremia", "Hypernatremia", "Potassium Disorders",
          "Acid Base Principles", "Metabolic Acidosis", "Metabolic Alkalosis"],
  obgyn: ["Prenatal Care", "Ectopic Pregnancy", "Intrapartum Fetal Monitoring",
          "Labor and Delivery Complications", "Hypertension in Pregnancy", "Postpartum",
          "Contraception", "Abnormal Uterine Bleeding"],
  peds: ["Delivery Room Care", "Newborn Nursery", "Newborn Hyperbilirubinemia",
         "Ear Infections and Fevers", "Vaccination", "Developmental Milestones", "Child Abuse",
         "Pediatric Screening", "General Pediatrics"],
  em: ["Chest Pain and Dyspnea", "Toxicology", "Trauma Basics", "Chest Trauma", "Abdominal Trauma", "Burns"],
  gi: ["Gastrointestinal Bleeding", "Cirrhosis", "Pancreatitis", "Gallstone Disease",
       "Biliary Disease", "Diarrhea"],
  id: ["Penicillins", "Beta Lactams", "Protein Synthesis Inhibitors", "Other Antibiotics",
       "Meningitis", "Adult Vaccinations", "HIV Infection", "HIV Drugs", "HIV Complications",
       "Tuberculosis", "Sexually-transmitted Infections"],
  psych: ["Depression", "Mania", "Psychotic Disorders", "Alcohol Use Disorder",
          "Substance Abuse I", "Substance Abuse II", "Antidepressants", "Antipsychotics"],
  heme: ["Blood Products", "Thrombocytopenia", "Coagulopathy", "Anticoagulants", "Hypercoagulable States"],
  msk: ["Low Back Pain", "Gout", "Arthritis I", "Arthritis II"],
  endo: ["Diabetes Mellitus", "Diabetes Complications", "Diabetes Treatment"],
  surg: ["Pre-operative Evaluation", "Post-operative Complications", "General Anesthesia"],
};

const HY = new Set(
  Object.entries(HIGH_YIELD).flatMap(([sec, titles]) => titles.map((t) => vid(sec, t)))
);

const slugMissing = () => {
  const real = new Set();
  SECTIONS.forEach((s) => s.videos.forEach((t) => real.add(vid(s.id, t))));
  return Array.from(HY).filter((id) => !real.has(id));
};

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
            hy: HY.has(v),
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

function blockFor(key, settings) {
  return (settings.blocks || []).find((b) => key >= b.start && key <= b.end) || null;
}

function baseCapacity(key, settings) {
  const g = parseKey(key).getDay();
  const b = blockFor(key, settings);
  if (g === 0) return b ? b.sun : settings.sunVideos;
  if (g === 6) return b ? b.sat : settings.satVideos;
  return b ? b.weekday : settings.weekdayVideos;
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
  const flags = state.flags || {};
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
      // The cap limits how much catch-up piles on; it never reduces a day below
      // what it was already set to (a heavy vacation day stays heavy).
      const cap = Math.max(targets[i], isWeekend(keys[i]) ? S.maxWeekendUnits : S.maxWeekdayUnits);
      const give = Math.min(want, cap);
      spill = want - give;
      targets[i] = give;
    }
  }
  // Being ahead does NOT lighten upcoming days. The queue simply drains faster,
  // which pulls the finish date earlier on its own.

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
      block: blockFor(k, S),
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

  // "Finished" means finished by now — a section whose last video is merely
  // scheduled is not yet eligible for older-system review.
  const finishedSections = Object.values(sectionDone)
    .filter((x) => x.last <= today)
    .sort((a, b) => a.last.localeCompare(b.last));
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
        hy: v.hy,
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
        // Anything flagged in this system leads; otherwise show a sample.
        topics: (x.videos.filter((v) => flags[v.id]).map((v) => v.title).concat(
          x.videos.filter((v) => !flags[v.id]).map((v) => v.title)
        )).slice(0, 3),
        weak: x.videos.filter((v) => flags[v.id]).map((v) => v.title),
      })),
    };
  });

  // --- Sketchy attached to videos finished before the plan started ---
  const strandedSketchy = [];
  cur.flat.forEach((v) => {
    if (!pre.has(v.id)) return;
    v.sketchy.forEach((sk) => strandedSketchy.push({ ...sk, from: v.title, section: v.sectionName }));
  });

  // --- flagged topics, freshest first ---
  const weakTopics = Object.keys(flags)
    .map((id) => ({ ...flags[id], id, video: cur.byId[id] }))
    .filter((x) => x.video)
    .map((x) => ({ ...x, staleDays: x.date ? Math.max(0, daysBetween(x.date, today)) : 0 }))
    // High yield first, then whatever has sat longest.
    .sort((a, b) => (b.video.hy ? 1 : 0) - (a.video.hy ? 1 : 0) || (a.date || "").localeCompare(b.date || ""));

  // --- projections ---
  const projectedFinish = finishKey || (plan.length ? plan[plan.length - 1].key : today);
  const weeksToTarget = Math.max(0.2, daysBetween(today, S.targetFinishDate) / 7);
  const requiredWeekly = remainingUnits > 0 ? remainingUnits / weeksToTarget : 0;
  const currentWeekly = S.weekdayVideos * 5 + S.satVideos + S.sunVideos;

  return {
    doneIds, pre, doneByDay, remaining, remainingUnits, totalUnits, completedUnits,
    delta, expected, loggedUnits, plan, projectedFinish, requiredWeekly, currentWeekly, sketchyBacklog, strandedSketchy, weakTopics, flags,
    daysLeft: daysBetween(today, projectedFinish),
    finishedSections, recentSections,
    phase: plan.length ? plan[0].phase : phaseFor(today, state, 0),
  };
}

/* ============================================================
   6. STORAGE
   ============================================================ */

const KEY = "bnb-planner:state:v1";

/* Bumped on every change. If the footer doesn't show this, the phone is running
   an older bundle than the one you uploaded. */
const BUILD = "build 23 · Aug 30";

/* Storage cascade. Capacitor Preferences on the phone, window.storage inside a
   Claude artifact, localStorage anywhere else. Each backend is probed once and
   verified with a real write, so a backend that exists but doesn't work is
   skipped rather than silently swallowing every save. */
let BACKEND = null;

async function capPrefs() {
  const C = typeof window !== "undefined" ? window.Capacitor : null;
  if (!C || !C.Plugins || !C.Plugins.Preferences) return null;
  const P = C.Plugins.Preferences;
  return {
    name: "Preferences",
    get: async (k) => (await P.get({ key: k })).value,
    set: async (k, v) => { await P.set({ key: k, value: v }); },
  };
}

function artifactStore() {
  if (typeof window === "undefined" || !window.storage) return null;
  return {
    name: "artifact",
    get: async (k) => {
      try {
        const r = await window.storage.get(k);
        return r && r.value ? r.value : null;
      } catch (e) {
        return null;
      }
    },
    set: async (k, v) => { await window.storage.set(k, v); },
  };
}

function localStore() {
  if (typeof window === "undefined" || !window.localStorage) return null;
  return {
    name: "localStorage",
    get: async (k) => window.localStorage.getItem(k),
    set: async (k, v) => { window.localStorage.setItem(k, v); },
  };
}

async function requestPersistence() {
  try {
    if (navigator.storage && navigator.storage.persist) {
      if (await navigator.storage.persisted()) return true;
      return await navigator.storage.persist();
    }
  } catch (e) {
    /* not supported — the cascade still works, it's just evictable */
  }
  return false;
}

async function pickBackend() {
  if (BACKEND) return BACKEND;
  const probe = KEY + ":probe";
  for (const make of [capPrefs, artifactStore, localStore]) {
    let b = null;
    try {
      b = await make();
    } catch (e) {
      b = null;
    }
    if (!b) continue;
    try {
      await b.set(probe, "1");
      const back = await b.get(probe);
      if (back === "1") {
        BACKEND = b;
        return b;
      }
    } catch (e) {
      /* try the next one */
    }
  }
  return null;
}

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
  blocks: [],
  sectionOrder: SECTIONS.map((s) => s.id),
};

/* Jess's log as of Aug 8 2026, restored from her export. This is the baseline
   the app ships with; the v4 migration below installs it over any older state. */
const RESTORE = {"version":7,"settings":{"startDate":"2026-08-05","targetFinishDate":"2026-12-31","paceMode":"fixed","weekdayVideos":1,"satVideos":3,"sunVideos":3,"catchUpWindowDays":7,"maxWeekdayUnits":3,"maxWeekendUnits":6,"maxSketchyPerDay":4,"pass2PerVideo":2,"randomWorkdayQ":12,"randomWeekendQ":25,"cdmPerWeek":3,"randomTailDays":70,"dailyMinutesWarn":90,"minPerVideo":18,"minPerSketchy":12,"minPerQuestion":2,"phaseOverride":null,"blocks":[{"id":"b1786202891935ovsk","label":"Inpatient","start":"2026-08-08","end":"2026-09-30","weekday":1,"sat":2,"sun":2},{"id":"b1786202981065eafd","label":"Vacation","start":"2026-10-01","end":"2026-10-31","weekday":2,"sat":3,"sun":3},{"id":"b178620307680917uv","label":"Vacation","start":"2026-12-01","end":"2026-12-31","weekday":2,"sat":3,"sun":3}],"sectionOrder":["pulm","renal","gi","cards","id","neuro","heme","psych","endo","msk","peds","obgyn","surg","em","behav","epi"]},"days":{"2026-07-20":{"type":"normal","videosDone":["pulm:asthma"]},"2026-07-21":{"type":"normal","videosDone":["pulm:copd-diagnosis"]},"2026-07-22":{"type":"normal","videosDone":["pulm:copd-treatment"]},"2026-07-23":{"type":"normal","videosDone":["pulm:restrictive-lung-disease"]},"2026-07-24":{"type":"normal","videosDone":["pulm:pneumonia"]},"2026-07-25":{"type":"normal","videosDone":["pulm:lung-cancer","pulm:bronchiectasis","pulm:shock"]},"2026-07-26":{"type":"normal","videosDone":["pulm:respiratory-failure","pulm:sepsis-ards"]},"2026-07-27":{"type":"normal","videosDone":["pulm:pulmonary-hypertension"]},"2026-07-28":{"type":"normal","videosDone":["pulm:dvt-and-pulmonary-embolism"]},"2026-07-29":{"type":"normal","videosDone":["pulm:pleural-disease"]},"2026-08-05":{"type":"normal","videosDone":["pulm:cystic-fibrosis","renal:acute-renal-failure","renal:chronic-kidney-disease","renal:fluids","renal:hyponatremia","renal:hypernatremia"],"sketchyDone":["path:Osmolality and sodium disorders"]},"2026-08-06":{"type":"normal","videosDone":["renal:potassium-disorders"],"questionsDone":3},"2026-08-07":{"type":"normal","videosDone":["renal:calcium-magnesium-and-phosphate-disorders"],"questionsDone":15},"2026-08-08":{"type":"normal","videosDone":["renal:acid-base-principles","renal:metabolic-acidosis"],"questionsDone":12},"2026-08-09":{"type":"normal","videosDone":["renal:metabolic-alkalosis","renal:respiratory-acid-base-disorders","renal:renal-tubular-acidosis"],"questionsDone":9},"2026-08-10":{"type":"normal","videosDone":["renal:nephrotic-syndrome"],"sketchyDone":["path:Nephrotic syndrome"],"questionsDone":7},"2026-08-11":{"type":"normal","videosDone":["renal:nephritic-syndrome"],"sketchyDone":["path:Nephritic syndrome"],"questionsDone":7},"2026-08-12":{"type":"normal","videosDone":["renal:rpgn"]},"2026-08-14":{"type":"normal","videosDone":["renal:nephrolithiasis"]},"2026-08-15":{"type":"normal","questionsDone":30,"videosDone":["renal:hematuria"]},"2026-08-16":{"type":"normal","videosDone":["renal:urinary-infections","renal:urinary-incontinence"],"questionsDone":15},"2026-08-17":{"type":"normal","videosDone":["renal:tubulointerstitial-disorders"]},"2026-08-18":{"type":"normal","videosDone":["renal:cystic-kidney-disease","renal:urinary-tract-malignancy"],"questionsDone":13},"2026-08-19":{"type":"normal","videosDone":["renal:diuretics"],"sketchyDone":["pharm:Loop diuretics","pharm:Thiazides","pharm:Potassium-sparing diuretics"]},"2026-08-20":{"type":"normal","videosDone":["renal:rhabdomyolysis"],"questionsDone":3},"2026-08-21":{"type":"normal","videosDone":["gi:esophageal-disorders"]},"2026-08-22":{"type":"normal","videosDone":["gi:gerd-and-esophageal-cancer","gi:gastric-disorders"],"questionsDone":12},"2026-08-23":{"type":"normal","videosDone":["gi:gastric-cancer"],"questionsDone":3},"2026-08-24":{"type":"normal","videosDone":["gi:liver-disease","gi:liver-masses"],"questionsDone":12},"2026-08-25":{"type":"normal","videosDone":["gi:cirrhosis"],"questionsDone":10},"2026-08-26":{"type":"normal","videosDone":["gi:viral-hepatitis"],"sketchyDone":["micro:Hepatitis B"]},"2026-08-28":{"type":"normal","videosDone":["gi:hyperbilirubinemia"],"questionsDone":6},"2026-08-29":{"type":"normal","videosDone":["gi:wilsons-disease","gi:hemochromatosis"],"questionsDone":16}},"preCompleted":["endo:thyroid-hormone","endo:hypothyroidism","endo:hyperthyroidism","endo:thyroid-nodules","endo:hyperaldosteronism","endo:cushing-syndrome","endo:adrenal-insufficiency","endo:diabetes-mellitus","endo:diabetes-complications","endo:diabetic-ketoacidosis","endo:insulin","endo:diabetes-treatment","endo:pituitary-gland","endo:hyperparathyroidism","endo:hypoparathyroidism-and-vitamin-d","endo:osteoporosis","pulm:pulmonary-function-tests"],"extraVideos":{},"flags":{"renal:nephritic-syndrome":{"note":"Treatment options for all","date":"2026-08-11"}}};

const freshState = () => JSON.parse(JSON.stringify(RESTORE));

function migrate(parsed) {
  parsed.settings = { ...DEFAULT_SETTINGS, ...parsed.settings };
  parsed.days = parsed.days || {};
  parsed.preCompleted = parsed.preCompleted || [];
  parsed.extraVideos = parsed.extraVideos || {};
  parsed.notes = parsed.notes || [];

  if (!parsed.version || parsed.version < 7) {
    // Install the restored baseline, keeping anything logged since the export.
    const base = JSON.parse(JSON.stringify(RESTORE));
    Object.keys(parsed.days).forEach((k) => {
      const existing = parsed.days[k];
      const hasWork =
        (existing.videosDone && existing.videosDone.length) ||
        existing.questionsDone ||
        existing.type === "off" ||
        (existing.sketchyDone && existing.sketchyDone.length);
      if (!base.days[k] && hasWork) base.days[k] = existing;
    });
    base.preCompleted = Array.from(new Set(base.preCompleted.concat(parsed.preCompleted)));
    base.extraVideos = { ...parsed.extraVideos, ...base.extraVideos };
    if (parsed.settings && parsed.settings.blocks && parsed.settings.blocks.length) {
      base.settings.blocks = parsed.settings.blocks;
    }
    base.flags = { ...(base.flags || {}), ...(parsed.flags || {}) };
    base.notes = (parsed.notes || []).concat(base.notes || []);
    // A video logged on a date shouldn't also sit in the undated pile.
    const dated = new Set(
      Object.values(base.days).flatMap((d) => d.videosDone || [])
    );
    base.preCompleted = base.preCompleted.filter((id) => !dated.has(id));
    return base;
  }
  return parsed;
}

async function loadState() {
  const b = await pickBackend();
  if (!b) return { state: null, error: "No storage backend available on this device." };
  try {
    const raw = await b.get(KEY);
    if (!raw) return { state: null, error: null };
    return { state: migrate(JSON.parse(raw)), error: null };
  } catch (e) {
    return { state: null, error: "Could not read saved data: " + (e && e.message ? e.message : e) };
  }
}

async function saveState(s) {
  const b = await pickBackend();
  if (!b) return "No storage backend available on this device.";
  try {
    const payload = JSON.stringify(s);
    await b.set(KEY, payload);
    // Verify: a write that reports success but doesn't persist is the failure
    // mode worth catching, so read it straight back.
    const back = await b.get(KEY);
    if (back !== payload) return "Write did not persist (" + b.name + ").";
    return null;
  } catch (e) {
    return (e && e.message ? e.message : String(e)) + " (" + b.name + ")";
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
  const [flagging, setFlagging] = useState(null);
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
            {day.block ? <span className="text-cyan-500"> · {day.block.label}</span> : null}
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
                <div key={v.id} className="flex items-stretch gap-2">
                  <div className="flex-1 min-w-0">
                    <Check
                      on={doneV.has(v.id)}
                      onClick={() => toggleV(v.id)}
                      sub={v.hy ? v.sectionName + " · high yield" : v.sectionName}
                    >
                      {v.hy ? <span className="text-amber-300 mr-1">★</span> : null}
                      {v.title}
                      {v.est !== 1 ? <span className="text-slate-500 font-mono text-xs"> · {v.est}u</span> : null}
                    </Check>
                  </div>
                  <button
                    onClick={() => setFlagging(flagging === v.id ? null : v.id)}
                    title="flag this as shaky"
                    className={
                      "shrink-0 w-11 rounded border text-lg " +
                      (en.flags[v.id]
                        ? "border-rose-800 bg-rose-950 text-rose-300"
                        : "border-slate-800 bg-slate-900 text-slate-600 hover:text-rose-400")
                    }
                  >
                    ⚑
                  </button>
                </div>
              ))
            )}
            {nextUp ? (
              <button
                onClick={() => toggleV(nextUp.id)}
                className="w-full text-left rounded border border-dashed border-slate-700 px-3 py-2.5 text-sm text-slate-400 hover:border-cyan-700 hover:text-cyan-300"
              >
                <span className="font-mono text-xs text-slate-600 mr-2">+</span>
                Watched an extra one — log{" "}
                <span className="text-slate-300">
                  {nextUp.hy ? <span className="text-amber-300">★ </span> : null}
                  {nextUp.title}
                </span>
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

          {flagging ? (
            <div className="rounded border border-rose-900 bg-rose-950 p-3">
              <div className="text-sm text-rose-200 mb-2">
                {(cur.byId[flagging] || {}).title}
              </div>
              <input
                value={(en.flags[flagging] || {}).note || ""}
                onChange={(e) =>
                  update((st2) => {
                    st2.flags = st2.flags || {};
                    st2.flags[flagging] = { note: e.target.value, date: today };
                  })
                }
                placeholder="what tripped you up? e.g. missed the FENa cutoff"
                className="w-full bg-slate-950 border border-rose-900 rounded px-2 py-2 text-sm text-slate-100 focus:border-rose-600 focus:outline-none"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setFlagging(null)}
                  className="flex-1 py-2 rounded border border-rose-800 text-sm text-rose-200"
                >
                  done
                </button>
                {en.flags[flagging] ? (
                  <button
                    onClick={() => {
                      update((st2) => { if (st2.flags) delete st2.flags[flagging]; });
                      setFlagging(null);
                    }}
                    className="px-4 py-2 rounded border border-slate-700 text-sm text-slate-400"
                  >
                    unflag
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

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
                    <span className="text-sm text-slate-200">
                      {it.hy ? <span className="text-amber-300 mr-1">★</span> : null}
                      {it.title}
                    </span>
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

function WeekView({ cur, state, en, today, update, setTab }) {
  const [offset, setOffset] = useState(0);
  const [editingQ, setEditingQ] = useState(null);

  const setQ = (k, n) =>
    update((st2) => {
      const d = (st2.days[k] = st2.days[k] || { type: "normal" });
      d.questionsDone = Math.max(0, n);
    });
  const bumpQ = (k, n) =>
    update((st2) => {
      const d = (st2.days[k] = st2.days[k] || { type: "normal" });
      d.questionsDone = Math.max(0, (d.questionsDone || 0) + n);
    });
  const start = addDays(today, offset * 7 - ((parseKey(today).getDay() + 6) % 7));
  const week = [];
  for (let i = 0; i < 7; i++) week.push(addDays(start, i));

  const rows = week.map((k) => {
    const planned = en.plan.find((d) => d.key === k);
    const log = state.days[k] || {};
    const logged = (log.videosDone || []).map((id) => cur.byId[id]).filter(Boolean);
    // The plan only runs forward from today, so past days come from the log.
    return { key: k, planned, log, videos: planned ? planned.videos : logged };
  });

  const hyThisWeek = rows.reduce((a, r) => a + r.videos.filter((v) => v.hy).length, 0);
  const doneThisWeek = rows.reduce((a, r) => a + (r.log.videosDone || []).length, 0);
  const qThisWeek = rows.reduce((a, r) => a + (r.log.questionsDone || 0), 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <button onClick={() => setOffset(offset - 1)} className="px-3 py-1 text-slate-400 hover:text-cyan-300 font-mono">
          ←
        </button>
        <span className="font-mono text-sm text-slate-400">
          {fmtShort(week[0])} – {fmtShort(week[6])}
          {hyThisWeek ? <span className="text-amber-300 ml-2">★ {hyThisWeek}</span> : null}
        </span>
        <button onClick={() => setOffset(offset + 1)} className="px-3 py-1 text-slate-400 hover:text-cyan-300 font-mono">
          →
        </button>
      </div>

      <div className="grid grid-cols-2 rounded border border-slate-800 bg-slate-900">
        <div className="px-3 py-2 border-r border-slate-800">
          <div className="text-xs uppercase tracking-widest text-slate-500">videos done</div>
          <div className="font-mono text-lg text-cyan-300 leading-tight">{doneThisWeek}</div>
        </div>
        <div className="px-3 py-2">
          <div className="text-xs uppercase tracking-widest text-slate-500">questions</div>
          <div className="font-mono text-lg text-cyan-300 leading-tight">{qThisWeek}</div>
        </div>
      </div>

      {rows.map(({ key: k, planned, log, videos }) => {
        const isToday = k === today;
        const past = k < today;
        const doneIds = log.videosDone || [];
        const type = log.type || "normal";
        const qDone = log.questionsDone || 0;
        const qTarget = planned ? (planned.isRandom ? planned.pass1 : planned.pass1Planned) : null;

        return (
          <div
            key={k}
            className={
              "rounded border p-3 " +
              (isToday ? "border-cyan-700 bg-slate-900" : past ? "border-slate-800 bg-slate-950" : "border-slate-800 bg-slate-900")
            }
          >
            <div className="flex items-baseline justify-between mb-2">
              <span className={"font-mono text-sm " + (isToday ? "text-cyan-300" : past ? "text-slate-500" : "text-slate-400")}>
                {fmtLong(k)}
                {isToday ? " ·  today" : ""}
              </span>
              <span className="font-mono text-xs text-slate-600">
                {type === "off"
                  ? "off"
                  : planned
                  ? (planned.block ? planned.block.label + " · " : "") + planned.minutes + "m"
                  : doneIds.length
                  ? doneIds.length + " done"
                  : ""}
              </span>
            </div>

            {videos.length ? (
              <div className="space-y-1">
                {videos.map((v) => {
                  const on = doneIds.includes(v.id);
                  return (
                    <div key={v.id} className="flex items-start gap-2 text-sm">
                      <button
                        onClick={() =>
                          update((st2) => {
                            const d = (st2.days[k] = st2.days[k] || { type: "normal" });
                            d.videosDone = d.videosDone || [];
                            d.videosDone = d.videosDone.includes(v.id)
                              ? d.videosDone.filter((x) => x !== v.id)
                              : d.videosDone.concat(v.id);
                          })
                        }
                        className={
                          "mt-0.5 shrink-0 w-4 h-4 rounded-sm border text-xs leading-none flex items-center justify-center " +
                          (on
                            ? "border-emerald-500 bg-emerald-500 text-emerald-950"
                            : "border-slate-600 text-transparent hover:border-slate-500")
                        }
                      >
                        ✓
                      </button>
                      <span className={on ? "text-slate-500 line-through" : "text-slate-200"}>
                        {v.hy ? <span className="text-amber-300 mr-1">★</span> : null}
                        {v.title}
                      </span>
                    </div>
                  );
                })}
                {planned && planned.sketchy.length ? (
                  <div className="flex flex-wrap gap-x-3 pt-1">
                    {planned.sketchy.map((sk, i) => (
                      <span key={i} className="text-xs text-slate-500 font-mono">
                        [{sk.s}] {sk.t}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="text-sm text-slate-600">
                {type === "off" ? "Day off" : past ? "nothing logged" : "—"}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 pt-2 border-t border-slate-800 text-xs font-mono text-slate-500">
              <button
                onClick={() => setEditingQ(editingQ === k ? null : k)}
                className={
                  "px-2 py-1 -ml-2 rounded hover:bg-slate-800 " + (qDone ? "text-cyan-400" : "text-slate-500")
                }
              >
                {qDone} question{qDone === 1 ? "" : "s"}
                {qTarget ? <span className="text-slate-600"> / {qTarget}</span> : null}
                <span className="text-slate-600 ml-1">{editingQ === k ? "−" : "＋"}</span>
              </button>
              {planned && planned.pass2 && planned.pass2.n ? <span>+{planned.pass2.n} recent</span> : null}
              {planned && planned.pass3 && planned.pass3.n ? <span>+{planned.pass3.n} older</span> : null}
            </div>

            {editingQ === k ? (
              <div className="mt-2 rounded border border-slate-700 bg-slate-950 p-2">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 5, 10].map((n) => (
                    <button
                      key={n}
                      onClick={() => bumpQ(k, n)}
                      className="flex-1 py-2 rounded border border-slate-700 text-sm text-slate-300 hover:border-cyan-600 font-mono"
                    >
                      +{n}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => bumpQ(k, -1)}
                    disabled={!qDone}
                    className="px-3 py-1.5 rounded border border-slate-800 text-xs text-slate-500 hover:border-slate-600 disabled:opacity-40"
                  >
                    −1
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={qDone}
                    onChange={(e) => setQ(k, Math.max(0, +e.target.value || 0))}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-100 font-mono text-center focus:border-cyan-500 focus:outline-none"
                  />
                  <button
                    onClick={() => setQ(k, 0)}
                    disabled={!qDone}
                    className="px-3 py-1.5 rounded border border-slate-800 text-xs text-slate-500 hover:border-slate-600 disabled:opacity-40"
                  >
                    clear
                  </button>
                </div>
              </div>
            ) : null}
            {planned && planned.pass2 && planned.pass2.n ? (
              <div className="text-xs text-slate-600 mt-1">recent: {planned.pass2.topics.join(", ")}</div>
            ) : null}
            {planned && planned.pass3 && planned.pass3.sources.length ? (
              <div className="text-xs text-slate-600 mt-1">older: {planned.pass3.sources.join(", ")}</div>
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
  const hyAll = cur.flat.filter((v) => v.hy);
  const hyTotal = hyAll.length;
  const hyDone = hyAll.filter((v) => en.doneIds.has(v.id) || en.pre.has(v.id)).length;
  const hyLeft = hyTotal - hyDone;
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
        <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">
          High yield <span className="text-amber-300">★</span>
        </div>
        <div className="rounded border border-slate-800 bg-slate-900 p-3">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-sm text-slate-300">Starred videos watched</span>
            <span className="font-mono text-sm">
              <span className="text-amber-300">{hyDone}</span>
              <span className="text-slate-600"> / {hyTotal}</span>
            </span>
          </div>
          <Bar pct={hyTotal ? (hyDone / hyTotal) * 100 : 0} tone={hyDone === hyTotal ? "good" : "warn"} />
          <div className="text-xs text-slate-500 mt-2 leading-relaxed">
            {hyLeft === 0
              ? "Every high-yield video is done."
              : hyLeft + " left — the topics Level 3 leans on hardest."}
          </div>
        </div>
      </div>

      {en.weakTopics.length ? (
        <div>
          <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Flagged as shaky</div>
          <div className="rounded border border-slate-800 bg-slate-900 divide-y divide-slate-800">
            {en.weakTopics.map((w) => (
              <div key={w.id} className="p-3">
                <div className="text-sm text-slate-200">
                  {w.video.hy ? <span className="text-amber-300 mr-1">★</span> : null}
                  {w.video.title}
                  <span className="text-xs text-slate-600 font-mono ml-2">{w.video.sectionName}</span>
                </div>
                {w.note ? <div className="text-sm text-rose-300 mt-1 leading-snug">{w.note}</div> : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

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
                    {s.videos.filter((v) => v.hy).length ? (
                      <span className="text-amber-300 mr-2">
                        ★{s.videos.filter((v) => v.hy && (en.doneIds.has(v.id) || en.pre.has(v.id))).length}/
                        {s.videos.filter((v) => v.hy).length}
                      </span>
                    ) : null}
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
   10b. REVIEW — flagged topics and anything else worth a second pass
   ============================================================ */

function ReviewView({ cur, state, en, today, update }) {
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(null);
  const notes = state.notes || [];

  const addNote = () => {
    const t = draft.trim();
    if (!t) return;
    update((st2) => {
      st2.notes = st2.notes || [];
      st2.notes.unshift({ id: "n" + Date.now().toString(36), text: t, date: today });
    });
    setDraft("");
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Flagged topics</div>
        {en.weakTopics.length ? (
          <div className="space-y-2">
            {en.weakTopics.map((w) => (
              <div key={w.id} className="rounded border border-rose-900 bg-rose-950 p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm text-slate-100 min-w-0">
                    {w.video.hy ? <span className="text-amber-300 mr-1">★</span> : null}
                    {w.video.title}
                  </span>
                  <button
                    onClick={() => update((st2) => { if (st2.flags) delete st2.flags[w.id]; })}
                    className="text-xs text-slate-500 hover:text-emerald-400 shrink-0"
                  >
                    got it
                  </button>
                </div>
                <div className="text-xs text-slate-500 mt-1 font-mono">
                  {w.video.sectionName}
                  {w.staleDays >= 7 ? <span className="text-slate-600"> · flagged {w.staleDays}d ago</span> : null}
                </div>
                <input
                  value={w.note || ""}
                  onChange={(e) =>
                    update((st2) => {
                      st2.flags[w.id] = { note: e.target.value, date: st2.flags[w.id].date || today };
                    })
                  }
                  placeholder="what tripped you up?"
                  className="w-full mt-2 bg-slate-950 border border-rose-900 rounded px-2 py-1.5 text-sm text-rose-200 focus:border-rose-600 focus:outline-none"
                />
                <div className="text-xs text-slate-500 mt-2 leading-relaxed">{w.video.amboss.join(" · ")}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded border border-slate-800 bg-slate-900 p-3 text-sm text-slate-500 leading-relaxed">
            Nothing flagged. Tap <span className="text-rose-400">⚑</span> beside a video on Today when
            something feels shaky, and it lands here.
          </div>
        )}
      </div>

      <div>
        <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Anything else to review</div>
        <div className="flex gap-2 mb-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addNote(); }}
            placeholder="e.g. anion gap vs delta gap"
            className="flex-1 min-w-0 bg-slate-950 border border-slate-700 rounded px-2 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
          />
          <button
            onClick={addNote}
            disabled={!draft.trim()}
            className="px-4 py-2 rounded border border-cyan-800 bg-cyan-950 text-cyan-200 text-sm hover:border-cyan-600 disabled:opacity-40 shrink-0"
          >
            add
          </button>
        </div>

        {notes.length ? (
          <div className="space-y-2">
            {notes.map((n, i) => (
              <div key={n.id} className="rounded border border-slate-800 bg-slate-900 p-3">
                {editing === n.id ? (
                  <textarea
                    autoFocus
                    value={n.text}
                    onChange={(e) => update((st2) => { st2.notes[i].text = e.target.value; })}
                    onBlur={() => setEditing(null)}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none resize-y"
                  />
                ) : (
                  <div className="text-sm text-slate-200 leading-snug whitespace-pre-wrap">{n.text}</div>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-slate-600 font-mono flex-1">{fmtShort(n.date)}</span>
                  <button
                    onClick={() => setEditing(editing === n.id ? null : n.id)}
                    className="text-xs text-slate-500 hover:text-cyan-300"
                  >
                    {editing === n.id ? "done" : "edit"}
                  </button>
                  <button
                    onClick={() => update((st2) => { st2.notes = st2.notes.filter((x) => x.id !== n.id); })}
                    className="text-xs text-slate-600 hover:text-rose-400"
                  >
                    remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-600 leading-relaxed">
            Jot down anything you want to come back to — a concept, a drug class, a question you
            got wrong that isn't tied to one video.
          </div>
        )}
      </div>
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
  const [note, setNote] = useState("");

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

      <Group title="Rotation blocks">
        <p className="text-xs text-slate-500 mb-3 leading-relaxed">
          Change the pace for a stretch. A hard block lightens the load; vacation raises it.
          The finish date updates as soon as you add one.
        </p>
        {(S.blocks || []).map((b, i) => (
          <div key={b.id} className="rounded border border-slate-800 bg-slate-900 p-3 mb-2">
            <div className="flex items-center gap-2 mb-2">
              <input
                value={b.label}
                onChange={(e) => update((st2) => { st2.settings.blocks[i].label = e.target.value; })}
                className={inputCls + " flex-1"}
              />
              <button
                onClick={() => update((st2) => { st2.settings.blocks.splice(i, 1); })}
                className="px-3 py-1.5 rounded border border-slate-800 text-xs text-slate-500 hover:border-rose-800 hover:text-rose-400"
              >
                remove
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="From">
                <input type="date" value={b.start}
                  onChange={(e) => update((st2) => { st2.settings.blocks[i].start = e.target.value; })}
                  className={inputCls} />
              </Field>
              <Field label="To">
                <input type="date" value={b.end}
                  onChange={(e) => update((st2) => { st2.settings.blocks[i].end = e.target.value; })}
                  className={inputCls} />
              </Field>
            </div>
            <div className="text-xs text-slate-500 mb-1">
              {b.weekday * 5 + b.sat + b.sun} videos/week during this block
              <span className="text-slate-600">
                {" "}vs {S.weekdayVideos * 5 + S.satVideos + S.sunVideos} normally
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Field label="Weekday">
                <input type="number" step="1" min="0" value={b.weekday}
                  onChange={(e) => update((st2) => { st2.settings.blocks[i].weekday = +e.target.value; })}
                  className={inputCls} />
              </Field>
              <Field label="Sat">
                <input type="number" step="1" min="0" value={b.sat}
                  onChange={(e) => update((st2) => { st2.settings.blocks[i].sat = +e.target.value; })}
                  className={inputCls} />
              </Field>
              <Field label="Sun">
                <input type="number" step="1" min="0" value={b.sun}
                  onChange={(e) => update((st2) => { st2.settings.blocks[i].sun = +e.target.value; })}
                  className={inputCls} />
              </Field>
            </div>
          </div>
        ))}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Hard block", weekday: 1, sat: 2, sun: 2 },
            { label: "Vacation", weekday: 2, sat: 3, sun: 3 },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() =>
                update((st2) => {
                  st2.settings.blocks = st2.settings.blocks || [];
                  const start = dayKey(new Date());
                  st2.settings.blocks.push({
                    id: "b" + Date.now() + Math.random().toString(36).slice(2, 6),
                    label: preset.label,
                    start,
                    end: addDays(start, 27),
                    weekday: preset.weekday,
                    sat: preset.sat,
                    sun: preset.sun,
                  });
                })
              }
              className="py-2 rounded border border-slate-700 text-sm text-slate-300 hover:border-cyan-600"
            >
              + {preset.label}
            </button>
          ))}
        </div>
        <div className="rounded border border-slate-800 bg-slate-950 p-3 mt-3 font-mono text-xs text-slate-400 leading-relaxed">
          finishing {fmtFinish(en.projectedFinish)}
          {(S.blocks || []).length ? " with these blocks applied" : " — no blocks set"}
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
          Videos you logged on a date show that date and are edited from Today or Week.
          Checking one here marks it finished with no date — for anything done before you
          started tracking.
        </p>
        <div className="space-y-1">
          {cur.sections.filter((s) => s.videos.length).map((s) => {
            const open = openSec === s.id;
            const isDated = (id) => !!en.doneByDay[id];
            const isDone = (id) => isDated(id) || (state.preCompleted || []).includes(id);
            const n = s.videos.filter((v) => isDone(v.id)).length;
            const undatedIds = s.videos.filter((v) => !isDated(v.id)).map((v) => v.id);
            const allUndatedDone =
              undatedIds.length > 0 && undatedIds.every((id) => (state.preCompleted || []).includes(id));
            return (
              <div key={s.id} className="rounded border border-slate-800 bg-slate-900">
                <button onClick={() => setOpenSec(open ? null : s.id)} className="w-full flex items-center gap-2 px-3 py-2 text-left">
                  <span className="flex-1 text-sm text-slate-300">{s.name}</span>
                  <span className={"font-mono text-xs " + (n === s.videos.length ? "text-emerald-400" : "text-slate-600")}>
                    {n}/{s.videos.length}
                  </span>
                  <span className="text-slate-600">{open ? "−" : "+"}</span>
                </button>
                {open ? (
                  <div className="px-3 pb-3 space-y-1 border-t border-slate-800 pt-2">
                    {undatedIds.length ? (
                      <button
                        onClick={() => update((st2) => {
                          st2.preCompleted = allUndatedDone
                            ? (st2.preCompleted || []).filter((id) => !undatedIds.includes(id))
                            : Array.from(new Set((st2.preCompleted || []).concat(undatedIds)));
                        })}
                        className="text-xs text-cyan-400 hover:text-cyan-300 mb-1"
                      >
                        {allUndatedDone ? "clear the undated ones" : "mark the rest done"}
                      </button>
                    ) : (
                      <div className="text-xs text-slate-600 mb-1">every video here is logged on a date</div>
                    )}
                    {s.videos.map((v) => {
                      const dated = isDated(v.id);
                      const on = isDone(v.id);
                      return (
                        <div key={v.id} className="flex items-center gap-2">
                          <button
                            disabled={dated}
                            onClick={() => update((st2) => {
                              const p = new Set(st2.preCompleted || []);
                              p.has(v.id) ? p.delete(v.id) : p.add(v.id);
                              st2.preCompleted = Array.from(p);
                            })}
                            className={"w-4 h-4 shrink-0 rounded-sm border text-xs leading-none flex items-center justify-center " +
                              (dated
                                ? "border-emerald-700 bg-emerald-700 text-emerald-950 cursor-default"
                                : on
                                ? "border-emerald-500 bg-emerald-500 text-emerald-950"
                                : "border-slate-600 text-transparent")}
                          >✓</button>
                          <span className={"flex-1 text-sm " + (on ? "text-slate-600 line-through" : "text-slate-300")}>
                            {v.hy ? <span className="text-amber-300 mr-1">★</span> : null}
                            {v.title}
                          </span>
                          {dated ? (
                            <span className="text-xs text-slate-600 font-mono shrink-0">{fmtShort(en.doneByDay[v.id])}</span>
                          ) : (
                            <button
                              onClick={() => update((st2) => {
                                const idx = cur.flat.findIndex((x) => x.id === v.id);
                                const upto = cur.flat
                                  .slice(0, idx + 1)
                                  .map((x) => x.id)
                                  .filter((id) => !en.doneByDay[id]);
                                st2.preCompleted = Array.from(new Set((st2.preCompleted || []).concat(upto)));
                              })}
                              className="text-xs text-slate-600 hover:text-cyan-300 shrink-0"
                              title="mark this and everything before it as done"
                            >through here</button>
                          )}
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
        <p className="text-xs text-slate-500 mb-3 leading-relaxed">
          Copy this somewhere safe before reinstalling the app.
        </p>
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => { setIo(JSON.stringify(state)); setNote(""); }}
            className="flex-1 py-2 rounded border border-slate-700 text-sm text-slate-300 hover:border-slate-600"
          >
            Export
          </button>
          <button
            onClick={async () => {
              const text = io && io.charAt(0) === "{" ? io : JSON.stringify(state);
              setIo(text);
              try {
                await navigator.clipboard.writeText(text);
                setNote("Copied " + text.length + " characters to the clipboard.");
              } catch (e) {
                setNote("Couldn't reach the clipboard — tap in the box, select all, copy.");
              }
            }}
            className="flex-1 py-2 rounded border border-cyan-800 bg-cyan-950 text-cyan-200 text-sm hover:border-cyan-600"
          >
            Copy
          </button>
        </div>
        <textarea
          value={io}
          onChange={(e) => { setIo(e.target.value); setNote(""); }}
          rows={8}
          placeholder="paste a backup here, then tap Restore"
          className={inputCls + " resize-y text-xs"}
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={async () => {
              try {
                const t = await navigator.clipboard.readText();
                setIo(t);
                setNote("Pasted " + t.length + " characters. Now tap Restore.");
              } catch (e) {
                setNote("Couldn't read the clipboard — long-press the box and paste manually.");
              }
            }}
            className="flex-1 py-2 rounded border border-slate-700 text-sm text-slate-300 hover:border-slate-600"
          >
            Paste
          </button>
          <button
            onClick={() => {
              const t = (io || "").trim();
              if (!t) return setNote("The box is empty — paste a backup first.");
              if (t.charAt(0) !== "{") return setNote("That doesn't look like a backup; it should start with {.");
              if (t.charAt(t.length - 1) !== "}") {
                return setNote("The backup is cut off — it should end with }. Copy the whole thing and try again.");
              }
              let p;
              try {
                p = JSON.parse(t);
              } catch (e) {
                return setNote("Couldn't read that: " + e.message);
              }
              if (!p || !p.settings) return setNote("That backup has no settings in it.");
              const days = p.days ? Object.keys(p.days).length : 0;
              const done = p.days
                ? Object.values(p.days).reduce((a, d) => a + ((d.videosDone || []).length), 0)
                : 0;
              reload(migrate(p));
              setNote("Restored " + days + " logged days and " + done + " completed videos.");
            }}
            className="flex-1 py-2 rounded border border-emerald-800 bg-emerald-950 text-emerald-200 text-sm hover:border-emerald-600"
          >
            Restore
          </button>
        </div>
        {note ? <div className="text-xs text-slate-400 mt-2 leading-relaxed">{note}</div> : null}
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
  const [savedAt, setSavedAt] = useState(null);
  const timer = useRef(null);
  const today = dayKey(new Date());

  const latest = useRef(null);
  const dirty = useRef(false);

  useEffect(() => {
    let live = true;
    (async () => {
      requestPersistence();
      const { state: s, error } = await loadState();
      if (!live) return;
      if (error) setSaveNote(error);
      setState(s || freshState());
      setLoading(false);
    })();
    return () => { live = false; };
  }, []);

  const flush = async () => {
    if (!latest.current || !dirty.current) return;
    const err = await saveState(latest.current);
    dirty.current = !!err;
    setSaveNote(err || "");
    if (!err) setSavedAt(new Date());
  };

  useEffect(() => {
    if (!state) return;
    latest.current = state;
    dirty.current = true;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, 400);
    return () => timer.current && clearTimeout(timer.current);
  }, [state]);

  // Closing or backgrounding the app must not drop a pending write.
  useEffect(() => {
    const onHide = () => {
      if (timer.current) clearTimeout(timer.current);
      flush();
    };
    const onVis = () => { if (document.visibilityState === "hidden") onHide(); };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", onHide);
    window.addEventListener("beforeunload", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", onHide);
      window.removeEventListener("beforeunload", onHide);
    };
  }, []);

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
  const gapSections = cur.sections.filter((s) => s.videos.length === 0);
  const pace = state.settings.weekdayVideos * 5 + state.settings.satVideos + state.settings.sunVideos;

  const TABS = [
    ["today", "Today"],
    ["week", "Week"],
    ["review", "Review"],
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

        {behind ? (
          <div className="rounded border border-slate-700 bg-slate-900 px-3 py-2 mb-3 text-sm text-slate-300">
            {`${Math.abs(en.delta)} video${Math.abs(en.delta) === 1 ? "" : "s"} behind — spread across the next ${state.settings.catchUpWindowDays} days.`}
          </div>
        ) : null}

        {saveNote ? (
          <div className="rounded border border-amber-800 bg-amber-950 px-3 py-2 mb-3 text-sm text-amber-200">
            <div className="font-medium">Not saving to this device</div>
            <div className="text-xs mt-1 font-mono break-words">{saveNote}</div>
            <div className="text-xs mt-2">
              Export a backup from Setup before closing.{" "}
              <button onClick={flush} className="underline hover:text-amber-100">retry</button>
            </div>
          </div>
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
                "px-2.5 py-2 text-sm border-b-2 -mb-px transition-colors " +
                (tab === id ? "border-cyan-400 text-cyan-300" : "border-transparent text-slate-500 hover:text-slate-300")
              }
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "today" ? <TodayView cur={cur} state={state} en={en} today={today} update={update} /> : null}
        {tab === "week" ? <WeekView cur={cur} state={state} en={en} today={today} update={update} setTab={setTab} /> : null}
        {tab === "review" ? <ReviewView cur={cur} state={state} en={en} today={today} update={update} /> : null}
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
          <div className="mt-1 text-slate-600">
            {BUILD}
            {savedAt ? (
              <span className="text-emerald-800">
                {" · saved "}
                {String(savedAt.getHours()).padStart(2, "0")}:{String(savedAt.getMinutes()).padStart(2, "0")}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
