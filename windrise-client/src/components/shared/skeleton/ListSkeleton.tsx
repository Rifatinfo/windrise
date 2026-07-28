const ListSkeleton = ({ count = 5 }: { count?: number }) => {
    return (
        <div className="space-y-2">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 animate-pulse">
                    
                    {/* checkbox */}
                    <div className="w-4 h-4 bg-gray-300 rounded-sm"></div>

                    {/* text */}
                    <div className="h-4 w-32 bg-gray-300 rounded"></div>

                    {/* action button */}
                    <div className="ml-auto w-4 h-4 bg-gray-300 rounded"></div>
                </div>
            ))}
        </div>
    );
};

export default ListSkeleton;