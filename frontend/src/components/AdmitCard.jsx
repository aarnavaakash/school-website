import { assetUrl } from '../config/api';

const AdmitCard = ({ student, examRoutine, id, className = '' }) => {
  if (!student) return null;

  const routineItems = examRoutine?.routine && examRoutine.routine.length > 0 
    ? examRoutine.routine 
    : [
        { subject: 'Exam Schedule Pending', date: 'To be notified', time: '--' }
      ];

  const examTitle = examRoutine?.examName || 'Examination Admit Card';

  return (
    <div
      id={id}
      className={`admit-card-element bg-white border-2 border-slate-800 p-8 mx-auto max-w-[800px] shadow-sm relative overflow-hidden text-slate-900 font-sans ${className}`}
      style={{ boxSizing: 'border-box', backgroundColor: '#ffffff' }}
    >
      {/* Header Banner */}
      <div className="mb-4">
        <img
          src="/folder/admit-card/header.jpg"
          alt="School Header"
          className="w-full max-h-24 object-contain"
          crossOrigin="anonymous"
        />
      </div>

      {/* Title & Passport Photo */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex-1 text-center">
          <div className="inline-block mt-2">
            <h2 className="text-xl font-black uppercase tracking-widest border-2 border-black px-6 py-1.5 bg-slate-50 leading-none">
              Admit Card
            </h2>
            <p className="text-base font-bold mt-2 text-slate-900 underline decoration-2 underline-offset-4">
              {examTitle}
            </p>
          </div>
        </div>

        {/* Passport Size Photo */}
        <div className="w-24 h-28 border-2 border-slate-800 bg-slate-50 flex-shrink-0 flex items-center justify-center overflow-hidden">
          {student.photo ? (
            <img
              src={assetUrl(student.photo)}
              alt={student.name || 'Student'}
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
              }}
            />
          ) : null}
          <div
            className={`text-[8px] text-slate-400 text-center px-1 font-bold ${student.photo ? 'hidden' : 'block'}`}
          >
            PASTE PHOTO HERE
          </div>
        </div>
      </div>

      {/* Student Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4 border-y-2 border-slate-200 py-3 text-left relative z-10">
        <div className="space-y-1">
          <p className="text-sm">
            <span className="font-bold w-28 inline-block">Name:</span>{' '}
            <span className="font-bold text-blue-900 uppercase">{student.name}</span>
          </p>
          <p className="text-sm">
            <span className="font-bold w-28 inline-block">Father's Name:</span>{' '}
            <span className="font-medium text-slate-800">{student.parentName || '--'}</span>
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm">
            <span className="font-bold w-24 inline-block">Class:</span>{' '}
            <span className="font-bold text-slate-900">{student.class}</span>
          </p>
          <p className="text-sm">
            <span className="font-bold w-24 inline-block">Roll No:</span>{' '}
            <span className="font-bold text-slate-900">{student.rollNumber}</span>
          </p>
        </div>
      </div>

      {/* Examination Schedule */}
      <div className="mb-4 text-left relative z-10">
        <h4 className="font-bold text-xs mb-2 uppercase tracking-wide bg-slate-900 text-white px-3 py-0.5 inline-block">
          Examination Schedule
        </h4>
        <table className="w-full border-collapse border-2 border-slate-800">
          <thead>
            <tr className="bg-slate-100">
              <th className="border-2 border-slate-800 p-2 text-left text-xs font-black uppercase">
                Subject
              </th>
              <th className="border-2 border-slate-800 p-2 text-center text-xs font-black uppercase">
                Date
              </th>
              <th className="border-2 border-slate-800 p-2 text-center text-xs font-black uppercase">
                Time
              </th>
            </tr>
          </thead>
          <tbody>
            {routineItems.map((row, rIdx) => (
              <tr key={rIdx} className="bg-white">
                <td className="border-2 border-slate-800 p-2 font-bold text-xs text-slate-800 uppercase">
                  {row.subject}
                </td>
                <td className="border-2 border-slate-800 p-2 text-center text-xs font-medium">
                  {row.date}
                </td>
                <td className="border-2 border-slate-800 p-2 text-center text-xs font-medium">
                  {row.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Important Instructions */}
      <div className="mb-6 text-[9px] leading-tight text-slate-700 text-left border-t border-slate-200 pt-3 relative z-10">
        <h5 className="font-bold uppercase mb-1.5 text-slate-900">
          Important Instructions for Candidates:
        </h5>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
          <p>1. Please confirm the correctness of all details and subject(s) mentioned in the Admit Card.</p>
          <p>2. Examination will start at 8:30 AM (IST). Entry is not permitted after 8:00 AM (IST). You must report to the exam centre latest by 8:00 AM (IST).</p>
          <p>3. The time of commencement of the examination is 8:30 AM (IST). To confirm the time and date(s) of the examination, please check the date sheet.</p>
          <p>4. No candidate shall be allowed thereafter. Also, no candidate shall be allowed to leave the examination centre before the exam is over.</p>
          <p>5. Kindly follow the instructions given by invigilators, especially for writing the Roll Number in your Answer Book. Mention the correct Question Paper Set in the Answer Book and Attendance Sheet.</p>
          <p>6. MOBILE, ChatGPT and other communication devices are not allowed inside the examination centre. You should not indulge in any unfair practice. If found, you will be booked under unfair means (UFM) activity and action will be taken as per the rules of the Board.</p>
          <p>7. Do not believe in fake videos and messages uploaded on social media. Do not spread rumours too. You could be booked under unfair means for spreading and promoting rumours.</p>
          <p>8. You should carry only Blue/Royal Blue ballpoint/Gel/Fountain Pen, Pencil, Eraser, Scale, Sharpener, Geometry Instruments, Colours, Brushes, Admit Card &amp; Identity-Card of the School etc. in a transparent pouch.</p>
          <p>9. If you are a regular candidate, you should wear a school uniform to appear in the examinations. If you are a private candidate, you can wear light clothes only.</p>
          <p>10. In case of any ambiguity found in the question paper, the same will be addressed by the school as per its policy.</p>
          <p>13. The English version of the question paper will prevail over the other version.</p>
        </div>
      </div>

      {/* Signatures */}
      <div className="flex justify-between items-end mt-4 pt-3 border-t-2 border-dashed border-slate-300 relative z-10">
        <div className="text-center">
          <img
            src="/folder/admit-card/sign-rituraj.png?v=2"
            alt="Exam Controller Sign"
            className="h-12 mx-auto mb-1 object-contain"
            crossOrigin="anonymous"
          />
          <div className="border-t border-black w-36 pt-0.5">
            <p className="text-[9px] font-bold text-slate-700 uppercase">Exam Controller</p>
          </div>
        </div>

        <div className="text-center">
          <img
            src="/folder/admit-card/sign-rohit.png?v=2"
            alt="Principal Sign"
            className="h-12 mx-auto mb-1 object-contain"
            crossOrigin="anonymous"
          />
          <div className="border-t border-black w-36 pt-0.5">
            <p className="text-[9px] font-bold text-slate-700 uppercase">Principal</p>
          </div>
        </div>
      </div>

      {/* Diagonal Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
        <div className="opacity-[0.07] font-black text-3xl sm:text-4xl lg:text-5xl rotate-[-40deg] whitespace-nowrap uppercase tracking-[0.15em] text-slate-900">
          HNP INSTITUTE OF EDUCATION
        </div>
      </div>
    </div>
  );
};

export default AdmitCard;
