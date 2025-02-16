import React from 'react';
import { Form, Input } from 'antd';

interface SaveInstancePageProps {
  form: ReturnType<typeof Form.useForm>; // Form instance passed from parent
  schedule: { course: Course; offering: Offering }[];
}

const SaveInstancePage: React.FC<SaveInstancePageProps> = ({
  form,
  schedule,
}) => {
  const getCourseName = (course: { course: Course; offering: Offering }) => {
    const name =
      course.offering.specificData.info.name +
      ' ' +
      course.offering.specificData.info.section;
    return name;
  };
  return (
    <div className="flex flex-col gap-1">
      <Form
        form={form[0]} // Connect the parent form instance
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        autoComplete="off"
      >
        <Form.Item
          label="Schedule Name"
          name="scheduleName"
          rules={[
            { required: true, message: 'Please input the schedule name!' },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
      <div className="flex-1">
        <div className="mt-1 flex flex-wrap gap-2">
          {schedule.map(details => (
            <span
              key={details.offering.id}
              className="
                              inline-block
                              bg-slate-100 
                              text-slate-700 
                              text-xs 
                              px-2 
                              py-1 
                              rounded-full 
                              font-medium
                            "
            >
              {getCourseName(details)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SaveInstancePage;
