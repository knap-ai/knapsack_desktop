import { Button, ButtonSize, ButtonVariant } from 'src/components/atoms/button'
import InputTextSearch from 'src/components/atoms/input-text-search'
import MenuItem, { MenuItemVariant } from 'src/components/molecules/MenuItem'

export interface IMultiSelectSearchProps {
  className?: string
  searchTerm: string
  isOpen: boolean
  iconInput?: React.ReactElement | React.ReactNode
  placeHolderInput?: string
  onClickInput?: () => void
  setSearchTerm: (searchTerm: string) => void
  menuTitle: string
  selectedSources?: {
    label: string
    onClick: () => void
    size: ButtonSize
    variant: ButtonVariant
    icon: React.ReactElement | React.ReactNode
  }[]
  filteredOptions?: {
    icon: React.ReactElement | React.ReactNode
    label: string
    variant: MenuItemVariant
    labelButton: string
    variantButton: ButtonVariant
    onClick: () => void
    onClickButton?: () => void
    sizeButton: ButtonSize
    hasButton: boolean
  }[]
}

const MultiSelectSearch = ({
  iconInput,
  placeHolderInput,
  onClickInput,
  setSearchTerm,
  searchTerm,
  isOpen,
  menuTitle,
  selectedSources,
  filteredOptions,
}: IMultiSelectSearchProps) => {
  return (
    <div className="flex flex-col flex-grow flex-1 h-full TightShadow bg-white p-2 rounded-lg">
      {!isOpen && (
        <div className="h-9 justify-start items-start gap-1 inline-flex flex-wrap flex-grow flex-1">
          {selectedSources?.map(source => (
            <Button
              key={source.label}
              variant={source.variant}
              size={source.size}
              label={source.label}
              icon={source.icon}
              onClick={source.onClick}
            />
          ))}
        </div>
      )}
      <div className="flex flex-row items-center h-11 px-2 py-2.5 rounded-lg inline-flex">
        <InputTextSearch
          icon={iconInput}
          placeholder={placeHolderInput}
          label={searchTerm}
          onClick={onClickInput}
          handlerPromptText={setSearchTerm}
        />
      </div>
      {isOpen && <div className="border-t border-gray-200" />}
      {isOpen && (
        <div className="flex flex-col items-start justify-start py-1.5 px-2 gap-1 bg-white overflow-scroll">
          <div className="flex flex-row items-center justify-start ">
            <span className="flex-1 text-sm font-semibold">{menuTitle}</span>
          </div>
          {filteredOptions?.map(option => (
            <MenuItem
              key={option.label}
              label={option.label}
              labelButton={option.labelButton}
              icon={option.icon}
              variantButton={option.variantButton}
              sizeButton={option.sizeButton}
              variant={option.variant}
              hasButton={option.hasButton}
              onClick={option.onClick}
              onClickButton={option.onClickButton}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default MultiSelectSearch
