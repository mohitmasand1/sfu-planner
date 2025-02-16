import React from 'react';
import { Tabs } from 'antd';

const { TabPane } = Tabs;

const Instructions: React.FC = () => {
  return (
    <Tabs defaultActiveKey="1">
      <TabPane tab="Create Schedule" key="1">
        <div className="flex flex-col items-center">
          <p className="mb-4 text-gray-700">
            To create a schedule, add courses by clicking the "Add Course"
            button. Then, use our intuitive drag and drop interface to choose
            the lectures for each course.
          </p>
          <img
            src="/assets/drag-and-drop.gif" // Replace with your gif path
            alt="Drag and Drop Process"
            className="w-full max-w-md border rounded shadow-sm"
          />
        </div>
      </TabPane>
      <TabPane tab="Save Schedule" key="2">
        <div className="flex flex-col items-center">
          <p className="mb-4 text-gray-700">
            After creating your schedule, click the "Save Schedule" button to
            securely store it.
          </p>
          <img
            src="/assets/save_schedule.png" // Replace with your image path
            alt="Save Schedule"
            className="w-full max-w-md border rounded shadow-sm"
          />
        </div>
      </TabPane>
      <TabPane tab="Load Schedule" key="3">
        <div className="flex flex-col items-center">
          <p className="mb-4 text-gray-700">
            To load a saved schedule, navigate to the "Load Schedule" option and
            select the schedule you wish to view or edit.
          </p>
          <img
            src="/assets/load_schedule.png" // Replace with your image path
            alt="Load Schedule"
            className="w-full max-w-md border rounded shadow-sm"
          />
        </div>
      </TabPane>
    </Tabs>
  );
};

export default Instructions;
