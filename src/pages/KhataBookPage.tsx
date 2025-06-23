import KhataBook from '../components/KhataBook';
import { useAppStore } from '../store/useAppStore';

export default function KhataBookPage() {
    const { khataEntries, setKhataEntries, khataPayments, setKhataPayments } = useAppStore();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <KhataBook
                    khataEntries={khataEntries}
                    setKhataEntries={(value) =>
                        typeof value === 'function'
                            ? setKhataEntries((value as (prev: typeof khataEntries) => typeof khataEntries)(khataEntries))
                            : setKhataEntries(value)
                    }
                    khataPayments={khataPayments}
                    setKhataPayments={(value) =>
                        typeof value === 'function'
                            ? setKhataPayments((value as (prev: typeof khataPayments) => typeof khataPayments)(khataPayments))
                            : setKhataPayments(value)
                    }
                />
            </div>
        </div>
    );
}