import { notFound } from 'next/navigation';
import { getCertificateByUuid } from '@/lib/google-sheets';

// 🔍 DATA FETCHING: reads the "Leaderboard" Google Sheet and matches by UUID
async function getCertificate(uuid) {
  return getCertificateByUuid(uuid);
}

export default async function VerifyPage({ params }) {
  const { uuid } = await params;
  const data = await getCertificate(uuid);

    // If no certificate matches the ID, instantly show a 404 page
    if (!data || !data.isValid) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">

            {/* Main Verification Card */}
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

                {/* Google Colors Top Bar */}
                <div className="h-2 flex">
                    <div className="flex-1 bg-[#4285F4]"></div> {/* Google Blue */}
                    <div className="flex-1 bg-[#EA4335]"></div> {/* Google Red */}
                    <div className="flex-1 bg-[#FBBC05]"></div> {/* Google Yellow */}
                    <div className="flex-1 bg-[#34A853]"></div> {/* Google Green */}
                </div>

                <div className="p-8 text-center">

                    {/* Success Checkmark Icon */}
                    <div className="mb-4 inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Official Verification</h1>
                    <p className="text-xs text-gray-500 mb-6 break-all">ID: {uuid}</p>

                    {/* Certificate Details */}
                    <div className="space-y-4 text-left border-t border-b border-gray-100 py-6 mb-6">
                        <div>
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Participant</label>
                            {/* Custom Yellow/Gold for Name */}
                            <p className="text-xl font-bold text-[#ebc836]">{data.name}</p>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Event</label>
                            <p className="text-md font-medium text-gray-800">Google Cloud Study Jams 2025</p>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Completion Date</label>
                            {/* Custom Grey for Date */}
                            <p className="text-md font-medium text-[#697278]">{data.date}</p>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Issued By</label>
                            <p className="text-md font-medium text-gray-800">GDGoC CMRIT</p>
                        </div>
                    </div>

                    {/* View Original Certificate Button */}
                    <a
                        href={data.certLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex justify-center items-center bg-[#4285F4] hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                    >
                        View Original Certificate
                        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                </div>

                <div className="bg-gray-50 px-8 py-4 text-center border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                        This digital credential confirms the successful completion of the specified requirements.
                    </p>
                </div>

            </div>
        </div>
    );
}