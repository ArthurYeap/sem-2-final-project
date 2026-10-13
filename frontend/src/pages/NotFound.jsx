import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#85554C] px-4 py-8 sm:px-6 lg:px-8">
            <div className="w-full max-w-lg">

                {/* 404 Panel */}
                <div className="relative overflow-hidden border-5 border-[#E7C5B1] bg-[#E7C5B1] p-10 shadow-[-8px_0px_#AD8971] sm:p-14">
                    <div className="absolute -left-8 -top-8 h-20 w-20 rounded-br-full bg-[#85554C] shadow-[0.25em_0.25em_0em_1em_#E7C5B1,0.25em_0.25em_0em_1.5em_#AD8971]" />

                    <div className="relative z-10 flex flex-col items-start gap-6">
                        <div className="space-y-2">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#85554C]">
                                Error
                            </p>
                            <h1 className="text-7xl font-black tracking-tight text-white drop-shadow-[0_5px_0_#AD8971] sm:text-8xl">
                                404
                            </h1>
                            <p className="text-xl font-black text-white drop-shadow-[0_2px_0_#AD8971]">
                                Page Not Found
                            </p>
                        </div>

                        <p className="max-w-sm text-sm font-semibold leading-6 text-[#85554C]">
                            The page you are looking for does not exist.
                        </p>

                        <Link
                            to="/home"
                            className="inline-flex items-center gap-2 rounded-br-[2em] border-b-4 border-r-4 border-white bg-[#AD8971] px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-white hover:text-[#AD8971] hover:border-[#AD8971] focus:outline-none focus:ring-2 focus:ring-[#85554C]"
                        >
                            <span aria-hidden="true">←</span>
                            Go back
                        </Link>
                    </div>
                </div>

            </div>
        </main>
    );
};

export default NotFound;