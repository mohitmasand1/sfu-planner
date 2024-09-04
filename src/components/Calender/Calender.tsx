import {
  Calendar,
  DateLocalizer,
  dayjsLocalizer,
  Event,
  EventProps,
  FormatInput,
  View,
  ViewsProps,
} from 'react-big-calendar';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './index.css';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import CustomEvent from './CustomEvent';
// import CustomToolbar from './CustomToolbar';
// import { Slider, SliderSingleProps } from 'antd';

dayjs.extend(utc);
dayjs.extend(timezone);
const localizer = dayjsLocalizer(dayjs);

const convertTermCodeToDate = (code: string): Date => {
  // Check the format of the term code
  if (!/1[0-9]{2}[147]/.test(code)) {
    console.error('Invalid term code format.');
    return new Date();
  }

  const yearLastTwo = parseInt(code.substring(1, 3), 10);
  const term = code.charAt(3);
  const fullYear = 2000 + yearLastTwo;

  let month: number;
  let day: number = 6;

  switch (term) {
    case '1': // Spring
      month = 0; // January is 0 in JavaScript Date
      break;
    case '4': // Summer
      month = 4; // May
      break;
    case '7': // Fall
      month = 8; // September
      break;
    default:
      console.error('Invalid term/semester code.');
      return new Date();
  }

  return new Date(2024, 0, 1);
};

interface CalenderProps {
  events?: Event[];
  views?: ViewsProps;
  defaultView?: View;
  minTime?: Date;
  maxTime?: Date;
  termCode: string;
}

const Calender: React.FC<CalenderProps> = props => {
  const {
    events = [],
    views = ['work_week'],
    defaultView = 'work_week',
    minTime = new Date(2024, 4, 6, 8, 0, 0),
    maxTime = new Date(2026, 4, 6, 20, 0, 0),
    termCode,
  } = props;

  const [date, setDate] = useState(() => convertTermCodeToDate(termCode));

  useEffect(() => {
    setDate(convertTermCodeToDate(termCode));
  }, [termCode]);

  const onNavigate = useCallback(
    (newDate: Date) => setDate(newDate),
    [setDate],
  );

  const onNextClick = useCallback(() => {
    setDate(prevState => {
      const newDate = new Date(prevState);
      newDate.setDate(prevState.getDate() + 7);
      return newDate;
    });
  }, []);

  const onPrevClick = useCallback(() => {
    setDate(prevState => {
      const newDate = new Date(prevState);
      newDate.setDate(prevState.getDate() - 7);
      return newDate;
    });
  }, []);

  const onTodayClick = useCallback(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const difference = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    today.setDate(today.getDate() - difference);
    setDate(today);
  }, []);

  const onResetClick = useCallback(() => {
    setDate(convertTermCodeToDate(termCode));
  }, [termCode]);

  const dateText = useMemo(() => {
    const endDate = new Date(date);
    endDate.setDate(date.getDate() + 4);
    const startDateText = date.toLocaleDateString('en-US', {
      month: 'long',
      day: '2-digit',
    });
    const endDateText = endDate.toLocaleDateString('en-US', {
      month: 'long',
      day: '2-digit',
    });
    return `${startDateText} - ${endDateText}`;
  }, [date]);

  const { components, formats } = useMemo(
    () => ({
      formats: {
        timeGutterFormat: (
          date: FormatInput,
          culture: string,
          localizer: DateLocalizer,
        ) => localizer.format(date, 'hh a', culture),
      },
      components: {
        toolbar: () => (
          <></>
          // <CustomToolbar
          //   onNextClick={onNextClick}
          //   onPrevClick={onPrevClick}
          //   onTodayClick={onTodayClick}
          //   onResetClick={onResetClick}
          //   dateText={dateText}
          // />
        ),
        event: ({
          event,
        }: EventProps<
          Event & { description?: ReactNode; className?: string }
        >) => {
          return (
            <CustomEvent
              title={event.title}
              description={event?.description}
              className={event?.className}
            />
          );
        },
      },
    }),
    [dateText],
  );

  console.log(date);

  // const marks: SliderSingleProps['marks'] = {
  //   0: '0°C',
  //   100: '100°C',
  // };

  return (
    // <div className="flex flex-col gap-2 mb-2">
    <Calendar
      localizer={localizer}
      events={events}
      views={views}
      defaultView={defaultView}
      min={minTime}
      max={maxTime}
      date={date}
      onNavigate={onNavigate}
      messages={{
        today: 'Now',
        work_week: 'Week',
        next: <RightOutlined />,
        previous: <LeftOutlined />,
      }}
      formats={formats}
      components={components}
      toolbar={true}
      selectable={true}
      step={10}
      timeslots={6}
      startAccessor="start"
      endAccessor="end"
      style={{ height: '100%', width: '100%' }}
    />
    // <Slider marks={marks} defaultValue={0} />
    // </div>
  );
};

export default Calender;
