import { RiLoader2Line } from '@remixicon/react';

const Loader = ({ color = 'text-primary-dark' }) => {
    return (
        <div className="w-full h-screen max-h-[90vh] flex items-center justify-center">
            <RiLoader2Line className={`text-3xl animate-spin ${color}`} />
        </div>
    );
};

export default Loader;
