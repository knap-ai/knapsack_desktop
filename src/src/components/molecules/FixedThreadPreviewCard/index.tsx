interface FixedThreadPreviewCardProps {
  title: string
  isSelected: boolean
  setIsSelected: () => void
  itemCount?: number
}

const FixedThreadPreviewCard = ({
  title,
  isSelected,
  setIsSelected,
  itemCount,
}: FixedThreadPreviewCardProps) => {
  return (
    <div
      onClick={() => setIsSelected()}
      className={`w-full pr-4 flex-col justify-start mb-2 items-start inline-flex cursor-pointer font-semibold text-sm py-1 mr-1 border transition-all duration-150 ${
        isSelected 
          ? 'opacity-100 text-warm-grey-950 bg-ks-warm-grey-100 rounded-r-lg border-ks-warm-grey-200' 
          : 'text-warm-grey-800 hover:bg-ks-warm-grey-100 hover:rounded-r-lg border-transparent hover:border-ks-warm-grey-200'
      }`}>
      <div className="ml-4 flex flex-row items-center w-full justify-between">
        <div className="flex items-center gap-x-3">
          {/* Mail Icon */}
          <svg 
            width="14" 
            height="15" 
            viewBox="0 0 14 15" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0 -mt-1"
          >
            <path 
              d="M13 7V13.5C13 13.6326 12.9473 13.7598 12.8536 13.8536M13 7L11.6392 6.49647C9.7232 5.78747 8.21253 4.2768 7.50353 2.36076L7 1L6.49647 2.36077C5.78747 4.2768 4.2768 5.78748 2.36076 6.49647L1 7M13 7L11.6392 7.50353C10.2378 8.02212 9.05315 8.96963 8.24051 10.191M12.8536 13.8536C12.7598 13.9473 12.6326 14 12.5 14H1.5C1.36739 14 1.24021 13.9473 1.14645 13.8536M12.8536 13.8536L8.24051 10.191M1.14645 13.8536C1.05268 13.7598 1 13.6326 1 13.5V7M1.14645 13.8536L5.75949 10.191M1 7L2.36077 7.50353C3.76225 8.02212 4.94685 8.96963 5.75949 10.191M5.75949 10.191C6.05785 10.6394 6.30607 11.1247 6.49647 11.6392L7 13L7.50353 11.6392C7.69393 11.1247 7.94215 10.6394 8.24051 10.191" 
              stroke={isSelected ? "#000000" : "#6A6969"} 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex items-center">
            <div className={`font-Lora truncate uppercase tracking-[1.44px] font-bold text-xs leading-4 ${isSelected ? 'text-ks-warm-grey-950' : 'text-ks-warm-grey-800'}`}>
              {title}
            </div>
            
            {title.toLowerCase().includes('autopilot') && (
              <div className="ml-2 px-1 py-0.5 text-[10px] text-ks-warm-grey-950 tracking-widest font-extrabold font-Lora border border-ks-warm-grey-300 rounded-md">
                BETA
              </div>
            )}
          </div>
        </div>
        
        {title.toLowerCase().includes('autopilot') && itemCount !== undefined && itemCount > 0 && (
          <span className="text-xs text-ks-warm-grey-800 mr-4">
            {itemCount}
          </span>
        )}
      </div>
    </div>
  )
}

export default FixedThreadPreviewCard