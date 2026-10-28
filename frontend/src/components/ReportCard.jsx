import React from 'react';
import { Plus, Trash2, User } from 'lucide-react';
import { assetUrl } from '../config/api';

export const calculateGrade = (score, maxScore) => {
  if (score === '' || score === null || score === undefined || isNaN(score)) return '-';
  const pct = (Number(score) / (Number(maxScore) || 100)) * 100;
  if (pct >= 90) return 'A1';
  if (pct >= 80) return 'A2';
  if (pct >= 70) return 'B1';
  if (pct >= 60) return 'B2';
  if (pct >= 50) return 'C1';
  if (pct >= 40) return 'C2';
  if (pct >= 33) return 'D';
  return 'E';
};

export const getDefaultReportCard = (student, targetExamName) => {
  const targetKey = targetExamName ? String(targetExamName).trim().toLowerCase() : '';

  // Check if student has reportCards array and find target or latest
  let targetRc = null;
  if (targetKey && Array.isArray(student?.reportCards)) {
    targetRc = student.reportCards.find(rc => {
      if (!rc) return false;
      const type = rc.examType ? String(rc.examType).trim().toLowerCase() : '';
      const name = rc.examName ? String(rc.examName).trim().toLowerCase() : '';
      const title = rc.examTitle ? String(rc.examTitle).trim().toLowerCase() : '';
      return type === targetKey || name === targetKey || title.includes(targetKey);
    });
  }
  if (!targetRc && student?.reportCard) {
    if (!targetKey) {
      targetRc = student.reportCard;
    } else {
      const type = student.reportCard.examType ? String(student.reportCard.examType).trim().toLowerCase() : '';
      const name = student.reportCard.examName ? String(student.reportCard.examName).trim().toLowerCase() : '';
      if (type === targetKey || name === targetKey) {
        targetRc = student.reportCard;
      }
    }
  }
  if (!targetRc && Array.isArray(student?.reportCards) && student.reportCards.length > 0 && !targetKey) {
    targetRc = student.reportCards[student.reportCards.length - 1];
  }

  // Check matching examResult if available
  let matchedExamResult = null;
  if (targetKey && Array.isArray(student?.examResults)) {
    matchedExamResult = student.examResults.find(er =>
      er?.examName && String(er.examName).trim().toLowerCase() === targetKey
    );
  }

  const defaultSubjects = [
    { subject: 'Mathematics', maxMarks: 80, obtained: '', grade: '' },
    { subject: 'Science', maxMarks: 80, obtained: '', grade: '' },
    { subject: 'Social Science (SST)', maxMarks: 80, obtained: '', grade: '' },
    { subject: 'Computer', maxMarks: 80, obtained: '', grade: '' },
    { subject: 'General Knowledge (GK)', maxMarks: 80, obtained: '', grade: '' },
    { subject: 'Hindi', maxMarks: 80, obtained: '', grade: '' },
    { subject: 'English', maxMarks: 80, obtained: '', grade: '' },
    { subject: 'Sanskrit', maxMarks: 80, obtained: '', grade: '' },
  ];

  let subjects = defaultSubjects;
  if (targetRc?.subjects?.length > 0) {
    subjects = targetRc.subjects;
  } else if (matchedExamResult?.marks?.length > 0) {
    subjects = matchedExamResult.marks.map(m => ({
      subject: m?.subject || 'Subject',
      maxMarks: m?.maxScore || 80,
      obtained: m?.score !== undefined ? m.score : '',
      grade: calculateGrade(m?.score, m?.maxScore || 80)
    }));
  } else if (Array.isArray(student?.marks) && student.marks.length > 0) {
    subjects = defaultSubjects.map((def) => {
      const existing = student.marks.find(
        (m) => m?.subject && String(m.subject).trim().toLowerCase() === String(def.subject).trim().toLowerCase()
      );
      if (existing) {
        return {
          subject: def.subject,
          maxMarks: existing.maxScore || 80,
          obtained: existing.score !== undefined ? existing.score : '',
          grade: calculateGrade(existing.score, existing.maxScore || 80)
        };
      }
      return def;
    });
  }

  const defaultCo = [
    { trait: 'Discipline & Conduct', grade: 'A' },
    { trait: 'Attendance & Regularity', grade: 'A' },
    { trait: 'Cleanliness & Uniform', grade: 'A' },
    { trait: 'Co-Curricular Participation', grade: 'A' },
  ];

  const coScholastic = targetRc?.coScholastic?.length > 0
    ? targetRc.coScholastic
    : defaultCo;

  const totalMax = subjects.reduce((sum, s) => sum + (Number(s?.maxMarks) || 80), 0);
  const hasAnyMarks = subjects.some(s => s?.obtained !== '' && s?.obtained !== null && s?.obtained !== undefined && !isNaN(s?.obtained));
  const totalObt = hasAnyMarks ? subjects.reduce((sum, s) => sum + (Number(s?.obtained) || 0), 0) : '';
  const percentage = hasAnyMarks && totalMax > 0 ? ((totalObt / totalMax) * 100).toFixed(2) : '';
  const overallGrade = hasAnyMarks ? calculateGrade(totalObt, totalMax) : '-';

  const chosenExamType = targetExamName || targetRc?.examType || student?.examName || 'Half Yearly Examination';
  const chosenExamStr = String(chosenExamType || 'Half Yearly Examination');
  const chosenExamTitle = targetRc?.examTitle || (chosenExamStr.toUpperCase().includes('REPORT') ? chosenExamStr.toUpperCase() : `${chosenExamStr.toUpperCase()} REPORT CARD`);

  // Only use saved totals if marks actually exist, otherwise fall back to empty state
  const resolvedObtained = hasAnyMarks ? (targetRc?.totalObtained !== undefined && targetRc?.totalObtained !== '' ? targetRc.totalObtained : totalObt) : '';
  const resolvedPct = hasAnyMarks 
    ? (targetRc?.percentage !== undefined && targetRc?.percentage !== '' 
        ? (typeof targetRc.percentage === 'number' ? `${targetRc.percentage}%` : targetRc.percentage) 
        : `${percentage}%`) 
    : '';
  const resolvedGrade = hasAnyMarks ? (targetRc?.overallGrade || overallGrade) : '-';
  const resolvedResult = hasAnyMarks ? (targetRc?.finalResult || (Number(percentage) >= 33 ? 'PASS' : 'NEEDS IMPROVEMENT')) : 'EVALUATION PENDING';

  return {
    session: targetRc?.session || student?.reportCard?.session || '2026-2027',
    examTitle: chosenExamTitle,
    examType: chosenExamType,
    admissionNo: targetRc?.admissionNo || student?.admissionNo || (student?.rollNumber ? `HNP-${student.rollNumber}` : 'HNP-001'),
    subjects,
    totalMaxMarks: totalMax,
    totalObtained: resolvedObtained,
    percentage: resolvedPct,
    overallGrade: resolvedGrade,
    finalResult: resolvedResult,
    coScholastic,
    remarks: targetRc?.remarks || 'Good academic performance and disciplined conduct in all activities.'
  };
};

export const STANDARD_EXAMS = [
  'Half Yearly Examination',
  'Annual Examination',
  'Periodic Test 1',
  'Periodic Test 2'
];

export const getAllStudentReportCards = (student) => {
  if (!student) return [];
  return STANDARD_EXAMS.map(examName => getDefaultReportCard(student, examName));
};

const ReportCard = ({
  student,
  reportCardData,
  isEditable = false,
  onChange,
  id = 'printable-report-card'
}) => {
  if (!student) return null;

  const data = reportCardData || getDefaultReportCard(student);

  const handleFieldChange = (field, value) => {
    if (!onChange) return;
    onChange({
      ...data,
      [field]: value
    });
  };

  const recalculateTotals = (updatedSubjects) => {
    if (!onChange) return;
    const totalMax = updatedSubjects.reduce((sum, s) => sum + (Number(s.maxMarks) || 0), 0);
    const hasAnyMarks = updatedSubjects.some(s => s && s.obtained !== '' && s.obtained !== null && s.obtained !== undefined && !isNaN(s.obtained));
    const totalObt = hasAnyMarks ? updatedSubjects.reduce((sum, s) => sum + (Number(s.obtained) || 0), 0) : '';
    const pct = hasAnyMarks && totalMax > 0 ? ((totalObt / totalMax) * 100).toFixed(2) : '';
    const overallGrade = hasAnyMarks && totalMax > 0 ? calculateGrade(totalObt, totalMax) : '-';
    const finalResult = hasAnyMarks && totalMax > 0 ? (Number(pct) >= 33 ? 'PASS' : 'NEEDS IMPROVEMENT') : (data.finalResult || 'EVALUATION PENDING');

    onChange({
      ...data,
      subjects: updatedSubjects,
      totalMaxMarks: totalMax,
      totalObtained: totalObt,
      percentage: hasAnyMarks ? `${pct}%` : '',
      overallGrade,
      finalResult
    });
  };

  const handleSubjectChange = (index, field, value) => {
    if (!onChange) return;
    const updatedSubjects = [...(data.subjects || [])];
    updatedSubjects[index] = {
      ...updatedSubjects[index],
      [field]: value
    };

    // Auto calculate grade if obtained or max marks change
    if (field === 'obtained' || field === 'maxMarks') {
      const score = field === 'obtained' ? value : updatedSubjects[index].obtained;
      const maxScore = field === 'maxMarks' ? value : updatedSubjects[index].maxMarks;
      updatedSubjects[index].grade = calculateGrade(score, maxScore);
    }

    recalculateTotals(updatedSubjects);
  };

  const handleAddSubject = () => {
    if (!onChange) return;
    const updatedSubjects = [
      ...(data.subjects || []),
      { subject: '', maxMarks: 80, obtained: '', grade: '' }
    ];
    recalculateTotals(updatedSubjects);
  };

  const handleDeleteSubject = (indexToDelete) => {
    if (!onChange) return;
    const updatedSubjects = (data.subjects || []).filter((_, idx) => idx !== indexToDelete);
    recalculateTotals(updatedSubjects);
  };

  const handleCoScholasticChange = (index, value) => {
    if (!onChange) return;
    const updatedCo = [...data.coScholastic];
    updatedCo[index] = {
      ...updatedCo[index],
      grade: value
    };
    onChange({
      ...data,
      coScholastic: updatedCo
    });
  };

  return (
    <div
      id={id}
      className="report-card-element bg-white text-slate-900 mx-auto select-text font-serif"
      style={{
        width: '210mm',
        minHeight: '297mm',
        maxWidth: '100%',
        boxSizing: 'border-box',
        padding: '10mm 12mm 8mm 12mm',
        backgroundColor: '#fdfbf7',
        color: '#1e293b',
        fontFamily: "'Georgia', 'Times New Roman', serif",
        position: 'relative'
      }}
    >
      {/* Laurel border SVG inline styles for reliable printing */}
      <style>{`
        #${id} .outer-border {
          border: 4px solid #1e3a8a;
          padding: 6px;
          height: 100%;
          min-height: 275mm;
          display: flex;
          flex-direction: column;
          position: relative;
          background: #fffdf9;
          box-shadow: inset 0 0 0 2px #d97706, inset 0 0 0 6px #ffffff;
          box-sizing: border-box;
        }
        #${id} .inner-border {
          border: 2px solid #d97706;
          padding: 10px 14px 8px 14px;
          height: 100%;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background-color: #fffdf9;
          position: relative;
          box-sizing: border-box;
        }
        #${id} .inner-border::before, #${id} .inner-border::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          width: 12px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='24' viewBox='0 0 12 24'%3E%3Crect width='12' height='24' fill='%231e3a8a'/%3E%3Cpath d='M6 2 C3 6 1 10 6 14 C11 10 9 6 6 2 Z' fill='%23fbbf24'/%3E%3Cpath d='M6 10 C3 14 1 18 6 22 C11 18 9 14 6 10 Z' fill='%23d97706'/%3E%3C/svg%3E");
          background-repeat: repeat-y;
          opacity: 0.9;
        }
        #${id} .inner-border::before { left: -14px; border-right: 1px solid #d97706; }
        #${id} .inner-border::after { right: -14px; border-left: 1px solid #d97706; }

        #${id} .header-box {
          background: linear-gradient(135deg, #0f2b5c 0%, #1e3a8a 50%, #0f2b5c 100%);
          border: 2px solid #d97706;
          border-radius: 6px;
          padding: 10px 12px;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: inset 0 0 10px rgba(217, 119, 6, 0.3);
          margin-bottom: 8px;
        }
        #${id} .logo-container {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          border: 2px solid #fbbf24;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }
        #${id} .logo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        #${id} .header-center {
          text-align: center;
          flex: 1;
          padding: 0 10px;
        }
        #${id} .school-title {
          font-size: 15.5pt;
          font-weight: bold;
          letter-spacing: 0.5px;
          color: #fef3c7;
          text-transform: uppercase;
          margin: 0;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.6);
          line-height: 1.2;
        }
        #${id} .school-address {
          font-size: 8.5pt;
          color: #e2e8f0;
          margin: 2px 0 1px 0;
          letter-spacing: 0.3px;
        }
        #${id} .trust-name {
          font-size: 7.5pt;
          color: #fbbf24;
          font-style: italic;
          margin-bottom: 4px;
        }
        #${id} .exam-title-input {
          background: linear-gradient(90deg, #b45309, #f59e0b, #b45309);
          color: #0f172a;
          font-weight: bold;
          font-size: 9.5pt;
          padding: 3px 14px;
          border-radius: 12px;
          letter-spacing: 1px;
          text-transform: uppercase;
          border: 1px solid #fef3c7;
          text-align: center;
          width: 82%;
          font-family: inherit;
          display: inline-block;
        }
        #${id} .section-label {
          font-size: 9pt;
          font-weight: bold;
          color: #1e3a8a;
          border-bottom: 2px solid #d97706;
          padding-bottom: 2px;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        #${id} .student-info-grid {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 8px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
        }
        #${id} .student-info-grid td {
          padding: 4px 6px;
          font-size: 8.5pt;
          border: 1px solid #e2e8f0;
        }
        #${id} .student-info-grid .field-label {
          font-weight: bold;
          color: #1e3a8a;
          width: 17%;
          background-color: #f8fafc;
        }
        #${id} .student-info-grid .field-value {
          width: 27%;
          color: #0f172a;
          font-weight: 500;
        }
        #${id} .student-info-grid .photo-cell {
          width: 82px;
          min-width: 82px;
          max-width: 82px;
          text-align: center;
          vertical-align: middle;
          padding: 3px;
          background-color: #ffffff;
          border: 1px solid #cbd5e1;
        }
        #${id} .student-photo-frame {
          width: 72px;
          height: 86px;
          border: 1.5px solid #1e3a8a;
          margin: 0 auto;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          border-radius: 2px;
          position: relative;
        }
        #${id} .student-photo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        #${id} .marks-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 8px;
          background: #ffffff;
        }
        #${id} .marks-table th {
          background-color: #1e3a8a;
          color: #ffffff;
          font-size: 8.5pt;
          font-weight: bold;
          padding: 5px 6px;
          border: 1px solid #1e3a8a;
          text-align: center;
          text-transform: uppercase;
        }
        #${id} .marks-table td {
          padding: 3px 4px;
          font-size: 8.5pt;
          border: 1px solid #cbd5e1;
          text-align: center;
        }
        #${id} .marks-table tr:nth-child(even) {
          background-color: #f8fafc;
        }
        #${id} .marks-table td.subject-name {
          text-align: left;
          font-weight: 600;
          padding-left: 10px;
          color: #1e293b;
        }
        #${id} .summary-box {
          background: #fefce8;
          border: 1px solid #f59e0b;
          border-radius: 4px;
          padding: 6px 8px;
          margin-bottom: 8px;
          display: flex;
          justify-content: space-around;
          align-items: center;
        }
        #${id} .summary-item {
          text-align: center;
        }
        #${id} .summary-title {
          font-size: 7.5pt;
          color: #b45309;
          font-weight: bold;
          text-transform: uppercase;
        }
        #${id} .summary-val {
          font-size: 9.5pt;
          font-weight: bold;
          color: #0f172a;
          margin-top: 1px;
        }
        #${id} .bottom-grid {
          display: flex;
          gap: 10px;
          margin-bottom: 8px;
          flex: 1;
        }
        #${id} .co-scholastic-box, #${id} .remarks-box {
          flex: 1;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          padding: 6px;
          display: flex;
          flex-direction: column;
        }
        #${id} .remarks-content {
          flex: 1;
          min-height: 90px;
          border: 1px dashed #cbd5e1;
          border-radius: 3px;
          margin-top: 4px;
          padding: 6px;
          background-color: #fafafa;
          font-size: 8.5pt;
          color: #334155;
          line-height: 1.4;
        }
        #${id} .co-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 4px;
          flex: 1;
        }
        #${id} .co-table th, #${id} .co-table td {
          border: 1px solid #cbd5e1;
          padding: 4px 6px;
          font-size: 8pt;
          text-align: center;
        }
        #${id} .co-table th {
          background-color: #f1f5f9;
          color: #334155;
        }
        #${id} .co-table td.trait {
          text-align: left;
          font-weight: 500;
        }
        #${id} .signature-container {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding: 8px 15px 4px 15px;
          margin-top: 4px;
        }
        #${id} .sig-block {
          text-align: center;
          width: 140px;
        }
        #${id} .sig-line {
          border-top: 1px solid #475569;
          margin-bottom: 3px;
        }
        #${id} .sig-title {
          font-size: 8pt;
          font-weight: bold;
          color: #1e3a8a;
        }
        #${id} .stamp-box {
          width: 58px;
          height: 58px;
          border: 2px dashed #d97706;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-size: 6pt;
          font-weight: bold;
          color: #b45309;
          text-transform: uppercase;
          background: #fffdf5;
        }
        #${id} input.editable-input {
          width: 100%;
          border: 1px dashed #94a3b8;
          background: #f8fafc;
          font-family: inherit;
          font-size: inherit;
          color: inherit;
          padding: 2px 4px;
          border-radius: 2px;
          text-align: inherit;
        }
        #${id} input.editable-input:focus {
          border-color: #2563eb;
          background: #ffffff;
          outline: none;
        }
      `}</style>

      <div className="outer-border">
        <div className="inner-border">
          {/* Header */}
          <header className="header-box">
            <div className="logo-container">
              <img
                src="/hnp-logo.jpg"
                alt="H.N.P. Institute Logo"
                className="logo-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://lh3.googleusercontent.com/gg-dl/AHiVA1lNSaVW8wP2WPKeUuWM6X_Nb2KT1e4-GyQ9qVhVPfiIHWGb6oHO7_Aj6-dRBkMNL658g-HN2uaUUN_qKxqh2gziwGP_DPtEkHkEiM9dnIJ8dFTkPAFvhBcfXiNzdYwvABZ_c01n6ZbslgQgmlCuFS6Aac1MXr5RCQ7KrHf4XO4jlSDbCg";
                }}
              />
            </div>
            <div className="header-center">
              <h1 className="school-title">H.N.P. INSTITUTE OF EDUCATION</h1>
              <div className="school-address">Chhatauni Bazar, Motihari, Bihar - 845401</div>
              <div className="trust-name">(Run & Managed by: Mira Educational & Welfare Trust)</div>
              <div>
                {isEditable ? (
                  <input
                    type="text"
                    className="exam-title-input"
                    value={data.examTitle}
                    onChange={(e) => handleFieldChange('examTitle', e.target.value)}
                  />
                ) : (
                  <div className="exam-title-input">{data.examTitle}</div>
                )}
              </div>
            </div>
            <div className="logo-container">
              <img
                src="/mira-logo.jpg"
                alt="Mira Trust Logo"
                className="logo-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://lh3.googleusercontent.com/gg/AJWXcNdrkaz3CPEFttOn6y-d_in18X8MdHNsj3HFffoEkK81BKPFUKVwlrMB3PW5ylYiP380rMQzUdm-Q-GrkPRSZ28-m-BEuHo2WJXAdqkD2aIYaoKD6ow0aWUkpc3JOBM6oiKTNfyMCeSIcOcbRGnq_lSNkFyKN5IEgvkEh_UPip6ZToTr78qn079i1MCWy2w8lcAIJI1I4pBAiGRSns6YTX3OL20ZtUEtu1__RTElcb9-AGTPNkUd0_6DbsNCQgl491Hov7YVHR9vPi1-emF6xS_b_F1M3FdHJfg=s0";
                }}
              />
            </div>
          </header>

          {/* Student Profile */}
          <div className="section-label">
            <span>Student's Profile</span>
            <span style={{ fontWeight: 'normal', fontSize: '8.5pt', color: '#475569' }}>
              Academic Session:{' '}
              {isEditable ? (
                <input
                  type="text"
                  className="editable-input font-bold"
                  style={{ width: '90px', display: 'inline-block' }}
                  value={data.session}
                  onChange={(e) => handleFieldChange('session', e.target.value)}
                />
              ) : (
                <span className="font-bold border border-slate-300 px-2 py-0.5 rounded bg-white text-slate-900 ml-1">
                  {data.session}
                </span>
              )}
            </span>
          </div>

          <table className="student-info-grid">
            <tbody>
              <tr>
                <td className="field-label">Student's Name:</td>
                <td className="field-value uppercase font-bold text-blue-950">
                  {student.name}
                </td>
                <td className="field-label">Class & Section:</td>
                <td className="field-value font-semibold">
                  {student.class}
                </td>
                <td rowSpan={3} className="photo-cell">
                  <div className="student-photo-frame">
                    {student.photo ? (
                      <img
                        src={assetUrl(student.photo)}
                        alt={student.name || 'Student'}
                        crossOrigin="anonymous"
                        className="student-photo-img"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallback = e.target.parentElement?.querySelector('.photo-fallback');
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="photo-fallback"
                      style={{
                        display: student.photo ? 'none' : 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px',
                        color: '#64748b',
                        width: '100%',
                        height: '100%'
                      }}
                    >
                      <User style={{ width: '22px', height: '22px', color: '#94a3b8' }} />
                      <span style={{ fontSize: '6pt', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '3px', color: '#64748b', letterSpacing: '0.02em' }}>
                        Affix Photo
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="field-label">Father's Name:</td>
                <td className="field-value">
                  {student.parentName || '--'}
                </td>
                <td className="field-label">Roll Number:</td>
                <td className="field-value font-mono font-bold">
                  {student.rollNumber}
                </td>
              </tr>
              <tr>
                <td className="field-label">Admission No:</td>
                <td className="field-value font-mono">
                  {isEditable ? (
                    <input
                      type="text"
                      className="editable-input"
                      value={data.admissionNo}
                      onChange={(e) => handleFieldChange('admissionNo', e.target.value)}
                      placeholder="e.g. HNP-001"
                    />
                  ) : (
                    data.admissionNo || `HNP-${student.rollNumber}`
                  )}
                </td>
                <td className="field-label">Examination:</td>
                <td className="field-value font-bold text-amber-800">
                  {isEditable ? (
                    <input
                      type="text"
                      className="editable-input"
                      value={data.examType}
                      onChange={(e) => handleFieldChange('examType', e.target.value)}
                    />
                  ) : (
                    data.examType
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Academic Performance Table */}
          <div className="section-label">Academic Performance</div>

          <table className="marks-table">
            <thead>
              <tr>
                <th style={{ width: isEditable ? '6%' : '8%' }}>S.No.</th>
                <th style={{ width: isEditable ? '40%' : '44%' }}>Subject Name</th>
                <th style={{ width: isEditable ? '15%' : '16%' }}>Max. Marks</th>
                <th style={{ width: isEditable ? '15%' : '16%' }}>Marks Obtained</th>
                <th style={{ width: isEditable ? '14%' : '16%' }}>Grade</th>
                {isEditable && (
                  <th style={{ width: '10%' }} className="no-print">
                    Delete
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {(data.subjects || []).map((sub, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td className="subject-name">
                    {isEditable ? (
                      <input
                        type="text"
                        className="editable-input"
                        placeholder="Subject Name"
                        value={sub.subject}
                        onChange={(e) => handleSubjectChange(index, 'subject', e.target.value)}
                      />
                    ) : (
                      sub.subject
                    )}
                  </td>
                  <td>
                    {isEditable ? (
                      <input
                        type="number"
                        className="editable-input text-center"
                        style={{ width: '60px' }}
                        value={sub.maxMarks}
                        onChange={(e) => handleSubjectChange(index, 'maxMarks', e.target.value)}
                      />
                    ) : (
                      sub.maxMarks
                    )}
                  </td>
                  <td className="font-bold text-slate-900">
                    {isEditable ? (
                      <input
                        type="number"
                        className="editable-input text-center font-bold"
                        style={{ width: '60px' }}
                        placeholder="-"
                        value={sub.obtained}
                        onChange={(e) => handleSubjectChange(index, 'obtained', e.target.value)}
                      />
                    ) : (
                      sub.obtained !== '' && sub.obtained !== undefined && sub.obtained !== null ? sub.obtained : '-'
                    )}
                  </td>
                  <td className="font-bold text-blue-900">
                    {isEditable ? (
                      <input
                        type="text"
                        className="editable-input text-center font-bold"
                        style={{ width: '50px' }}
                        value={sub.grade}
                        onChange={(e) => handleSubjectChange(index, 'grade', e.target.value)}
                      />
                    ) : (
                      sub.grade || calculateGrade(sub.obtained, sub.maxMarks)
                    )}
                  </td>
                  {isEditable && (
                    <td className="no-print" style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleDeleteSubject(index)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer inline-flex items-center justify-center"
                        title={`Delete ${sub.subject || 'subject'}`}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {isEditable && (
            <div className="flex justify-between items-center my-2 no-print">
              <button
                type="button"
                onClick={handleAddSubject}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-300 text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-blue-700" /> Add Subject
              </button>
              <span className="text-[10px] text-slate-500 italic">
                {data.subjects?.length || 0} subjects configured • Total Max: {data.totalMaxMarks || 0}
              </span>
            </div>
          )}

          {/* Result Summary */}
          <div className="summary-box">
            <div className="summary-item">
              <div className="summary-title">Total Max Marks</div>
              <div className="summary-val font-mono">{data.totalMaxMarks || 640}</div>
            </div>
            <div style={{ height: '24px', borderLeft: '1px solid #fde047' }}></div>
            <div className="summary-item">
              <div className="summary-title">Total Obtained</div>
              <div className="summary-val font-mono text-blue-950">
                {data.totalObtained !== '' && data.totalObtained !== undefined
                  ? `${data.totalObtained} / ${data.totalMaxMarks || 640}`
                  : `__ / ${data.totalMaxMarks || 640}`}
              </div>
            </div>
            <div style={{ height: '24px', borderLeft: '1px solid #fde047' }}></div>
            <div className="summary-item">
              <div className="summary-title">Percentage</div>
              <div className="summary-val font-mono text-emerald-800">
                {data.percentage ? (String(data.percentage).includes('%') ? data.percentage : `${data.percentage}%`) : '__ %'}
              </div>
            </div>
            <div style={{ height: '24px', borderLeft: '1px solid #fde047' }}></div>
            <div className="summary-item">
              <div className="summary-title">Overall Grade</div>
              <div className="summary-val text-blue-900 font-extrabold">{data.overallGrade || '-'}</div>
            </div>
            <div style={{ height: '24px', borderLeft: '1px solid #fde047' }}></div>
            <div className="summary-item">
              <div className="summary-title">Final Result</div>
              <div className="summary-val" style={{ color: '#1e3a8a', fontSize: '9pt', fontWeight: 'bold' }}>
                {isEditable ? (
                  <input
                    type="text"
                    className="editable-input font-bold uppercase text-center"
                    style={{ width: '130px', fontSize: '8pt', color: '#1e3a8a' }}
                    value={data.finalResult}
                    onChange={(e) => handleFieldChange('finalResult', e.target.value)}
                  />
                ) : (
                  data.finalResult || 'PASS / NEEDS IMPROVEMENT'
                )}
              </div>
            </div>
          </div>

          {/* Co-Scholastic & Remarks */}
          <div className="bottom-grid">
            <div className="co-scholastic-box">
              <div className="section-label" style={{ fontSize: '8.5pt', borderBottom: '1px solid #cbd5e1' }}>
                Co-Scholastic Assessment
              </div>
              <table className="co-table">
                <thead>
                  <tr>
                    <th style={{ width: '70%' }}>Activity / Trait</th>
                    <th style={{ width: '30%' }}>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.coScholastic || []).map((co, index) => (
                    <tr key={index}>
                      <td className="trait">{co.trait}</td>
                      <td>
                        {isEditable ? (
                          <input
                            type="text"
                            className="editable-input text-center font-bold"
                            style={{ width: '40px' }}
                            value={co.grade}
                            onChange={(e) => handleCoScholasticChange(index, e.target.value)}
                          />
                        ) : (
                          <span className="font-bold text-blue-900">{co.grade || 'A'}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="remarks-box">
              <div className="section-label" style={{ fontSize: '8.5pt', borderBottom: '1px solid #cbd5e1' }}>
                Teacher's Remarks
              </div>
              <div className="remarks-content">
                {isEditable ? (
                  <textarea
                    rows={4}
                    className="w-full h-full bg-transparent border-none resize-none outline-none font-serif text-sm"
                    placeholder="Enter teacher's remarks here..."
                    value={data.remarks}
                    onChange={(e) => handleFieldChange('remarks', e.target.value)}
                  />
                ) : (
                  <p className="italic text-slate-700 m-0">
                    "{data.remarks || 'Good performance and active participation in classroom discussions.'}"
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="signature-container">
            <div className="sig-block">
              <div className="h-8"></div>
              <div className="sig-line"></div>
              <div className="sig-title">Class Teacher's Signature</div>
            </div>
            <div className="stamp-box">
              School<br />Stamp / Seal
            </div>
            <div className="sig-block">
              <div className="h-8"></div>
              <div className="sig-line"></div>
              <div className="sig-title">Parent / Guardian Signature</div>
            </div>
            <div className="sig-block">
              <div className="h-8 flex items-end justify-center">
                <img
                  src="/folder/admit-card/sign-rohit.png?v=2"
                  alt="Principal Signature"
                  className="max-h-8 object-contain mix-blend-multiply"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div className="sig-line"></div>
              <div className="sig-title">Principal's Signature</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
