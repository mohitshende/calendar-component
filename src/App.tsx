import DateRangePicker from "./components/DateRangePicker";
import { getPredefinedDateRanges } from "./utils/datepickerUtils";

function App() {
  return (
    <div className="container">
      <DateRangePicker
        onChange={(range, weekdays) => {
          console.log(range, weekdays);
        }}
        predefinedRanges={getPredefinedDateRanges()}
      />
    </div>
  );
}

export default App;
