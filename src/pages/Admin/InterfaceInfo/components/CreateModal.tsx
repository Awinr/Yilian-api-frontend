import { DrawerForm, ProColumns, ProFormInstance, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { EditableProTable } from '@ant-design/pro-table';
import '@umijs/max';
import { useModel } from '@umijs/max';
import { Form, Input } from 'antd';
import React, { useRef, useState } from 'react';

export type FormValueType = {
    target?: string;
    template?: string;
    type?: string;
    time?: string;
    frequency?: string;
} & Partial<API.RuleListItem>;

export type Props = {
    columns: ProColumns<API.InterfaceInfoVO>[];
    setVisible: (visible: boolean) => void;
    onSubmit: (values: API.InterfaceInfoVO) => Promise<void>;
    visible: boolean;
    requestColumns: ProColumns<API.RequestParamsRemarkVO>[];
    responseColumns: ProColumns<API.RequestParamsRemarkVO>[];
};

const CreateModal: React.FC<Props> = (props) => {
    const { visible, setVisible, onSubmit, requestColumns, responseColumns } = props;
    const formRef = useRef<ProFormInstance>();
    // @ts-ignore
    const [requestEditableKeys, setRequestEditableKeys] = useState<React.Key[]>(() => []);
    const [requestDataSource, setRequestDataSource] = useState<
        readonly API.RequestParamsRemarkVO[]
    >([]);
    // @ts-ignore
    const [responseEditableKeys, setResponseEditableKeys] = useState<React.Key[]>(() => []);
    const [responseDataSource, setResponseDataSource] = useState<
        readonly API.ResponseParamsRemarkVO[]
    >([]);
    const { initialState, setInitialState } = useModel('@@initialState');
    const { loginUser } = initialState || {};
    const general_path = process.env.NODE_ENV==='production'?'/interface/api/general':'/api/general';
    return (
        <DrawerForm<API.InterfaceInfoVO>
            onFinish={async (value) => {
                console.log('---------->', value);
                onSubmit?.(value);
            }}
            formRef={formRef}
            formKey="update-modal-form"
            autoFocusFirstInput
            onOpenChange={setVisible}
            title="新增接口"
            open={visible}
        >
            <ProFormText
                name="name"
                label="接口名称"
                rules={[{ required: true, message: '接口名称不可为空！' }]}
            />

            <ProFormText
                name="description"
                label="描述"
                rules={[{ required: true, message: '描述不可为空！' }]}
            />
            <ProFormSelect
                name="method"
                label="请求方法"
                options={[
                    { label: 'GET', value: 'GET' },
                    { label: 'POST', value: 'POST' },
                    { label: 'PUT', value: 'PUT' },
                ]}
                rules={[{ required: true, message: '请求方法不可为空！' }]}
            />

            <ProFormText
                name="path"
                label="接口路径"
                // 默认是这个，请和后端约定好
                initialValue={general_path}
                rules={[{ required: true, message: '接口路径不可为空！' }]}
                // 不是管理员不允许修改本项
                hidden={loginUser?.userRole!=='admin'}
            />
            <ProFormText
                name="url"
                label="接口地址"
                rules={[{ required: true, message: '接口地址不可为空！' }]}
            />
            <Form.Item name="requestParams" label="请求参数示例">
                <Input.TextArea />
            </Form.Item>
            <Form.Item name="requestParamsRemark" label="请求参数说明">
                <EditableProTable<API.RequestParamsRemarkVO>
                    rowKey="id"
                    toolBarRender={false}
                    columns={requestColumns}
                    value={requestDataSource}
                    onChange={setRequestDataSource}
                    recordCreatorProps={{
                        newRecordType: 'dataSource',
                        position: 'bottom',
                        record: () => ({
                            id: Date.now(),
                            isRequired: 'no',
                            type: 'string',
                        }),
                    }}
                    editable={{
                        type: 'multiple',
                        editableKeys: requestEditableKeys,
                        onChange: setRequestEditableKeys,
                        actionRender: (row, _, dom) => {
                            return [dom.delete];
                        },
                        onValuesChange: (record, recordList) => {
                            setRequestDataSource(recordList);
                            formRef.current?.setFieldsValue({
                                requestParamsRemark: recordList,
                            });
                        },
                    }}
                />
            </Form.Item>

            <Form.Item name="responseParamsRemark" label="响应参数说明">
                <EditableProTable<API.ResponseParamsRemarkVO>
                    rowKey="id"
                    toolBarRender={false}
                    columns={responseColumns}
                    value={responseDataSource}
                    onChange={setResponseDataSource}
                    recordCreatorProps={{
                        newRecordType: 'dataSource',
                        position: 'bottom',
                        record: () => ({
                            id: Date.now(),
                            type: 'string',
                        }),
                    }}
                    editable={{
                        type: 'multiple',
                        editableKeys: responseEditableKeys,
                        onChange: setResponseEditableKeys,
                        actionRender: (row, _, dom) => {
                            return [dom.delete];
                        },
                        onValuesChange: (record, recordList) => {
                            setResponseDataSource(recordList);
                            formRef.current?.setFieldsValue({
                                responseParamsRemark: recordList,
                            });
                        },
                    }}
                />
            </Form.Item>
            <Form.Item name="requestHeader" label="请求头">
                <Input.TextArea />
            </Form.Item>
            <Form.Item name="responseHeader" label="响应头">
                <Input.TextArea />
            </Form.Item>
        </DrawerForm>
    );
};
export default CreateModal;
