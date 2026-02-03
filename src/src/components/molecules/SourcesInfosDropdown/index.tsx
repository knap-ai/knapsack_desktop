import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'

export interface SourcesInfosDropdownProps {
  sources?: string[]
  selectedSources?: string[]
  onSourcesChange?: (sources: string[]) => void
}

export function SourcesInfosDropdown() {
  return (
    <div className="SourcesInfosDropdown">
      <Accordion
        className="SourcePanel__DataSources__Accordion mb-6"
        //slotProps={{ heading: { component: 'h4' } }} -- No overload matches this call. - Commented for build
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <div className="flex justify-around">
            <p className="pr-4">Look at:</p>
            <div className="inline-flex items-center gap-2">
              <img
                className="max-h-5"
                src="/assets/images/dataSources/gcal.svg"
                alt="Google Calendar icon"
              />
              <img
                className="max-h-5"
                src="/assets/images/dataSources/gmail.svg"
                alt="Gmail icon"
              />
              <img
                className="max-h-5"
                src="/assets/images/dataSources/gdrive.svg"
                alt="Google Drive icon"
              />
            </div>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            <FormControlLabel control={<Checkbox defaultChecked />} label="Web"></FormControlLabel>
            <FormControlLabel control={<Checkbox />} label="Gmail" />
            <FormControlLabel control={<Checkbox />} label="Calendar" />
            <FormControlLabel control={<Checkbox />} label="Local files" />
            <FormControlLabel control={<Checkbox />} label="Google Drive" />
          </FormGroup>
        </AccordionDetails>
      </Accordion>
    </div>
  )
}

export default SourcesInfosDropdown
