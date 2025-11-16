import React, { useEffect, useState } from 'react';
import {
  ProForm,
  ProFormDigit,
  ProFormText,
  ProFormRadio,
  ProFormTreeSelect,
  ProFormSelect,
} from '@ant-design/pro-components';
import { Form, Modal} from 'antd';
import { useIntl, FormattedMessage } from '@umijs/max';
import { DataNode } from 'antd/es/tree';
import { createIcon } from '@/utils/IconUtil';
import { DictValueEnumObj } from '@/components/DictTag';
import IconSelector from '@/components/IconSelector';

export type MenuFormData = Record<string, unknown> & Partial<API.System.Menu>;

export type MenuFormProps = {
  onCancel: (flag?: boolean, formVals?: MenuFormData) => void;
  onSubmit: (values: MenuFormData) => Promise<void>;
  open: boolean;
  values: Partial<API.System.Menu>;
  visibleOptions: DictValueEnumObj;
  statusOptions: DictValueEnumObj;
  menuTree: DataNode[];
};

const MenuForm: React.FC<MenuFormProps> = (props) => {

  const [form] = Form.useForm();

  const [menuTypeId, setMenuTypeId] = useState<any>('M');
  const [menuIconName, setMenuIconName] = useState<any>();
  const [iconSelectorOpen, setIconSelectorOpen] = useState<boolean>(false);

  const { menuTree, visibleOptions, statusOptions } = props;

  useEffect(() => {
    form.resetFields();
    setMenuIconName(props.values.icon);
    
    // 判断是否为新增模式（没有 menuId）
    const isNew = !props.values.menuId;
    
    // 设置表单值，新增时使用默认值
    form.setFieldsValue({
      menuId: props.values.menuId,
      menuName: props.values.menuName,
      parentId: props.values.parentId !== undefined ? props.values.parentId : (isNew ? 0 : undefined),
      orderNum: props.values.orderNum !== undefined ? props.values.orderNum : (isNew ? 1 : undefined),
      path: props.values.path,
      component: props.values.component,
      query: props.values.query,
      isFrame: props.values.isFrame !== undefined ? props.values.isFrame : (isNew ? '1' : undefined),
      isCache: props.values.isCache !== undefined ? props.values.isCache : (isNew ? '0' : undefined),
      menuType: props.values.menuType || (isNew ? 'M' : undefined),
      visible: props.values.visible !== undefined ? props.values.visible : (isNew ? '0' : undefined),
      status: props.values.status !== undefined ? props.values.status : (isNew ? '0' : undefined),
      perms: props.values.perms,
      icon: props.values.icon,
      createBy: props.values.createBy,
      createTime: props.values.createTime,
      updateBy: props.values.updateBy,
      updateTime: props.values.updateTime,
      remark: props.values.remark,
    });
    
    // 设置菜单类型状态，新增时默认为 'M'
    if (isNew && !props.values.menuType) {
      setMenuTypeId('M');
    } else if (props.values.menuType) {
      setMenuTypeId(props.values.menuType);
    }
  }, [form, props]);

  const intl = useIntl();
  const handleOk = () => {
    form.submit();
  };
  const handleCancel = () => {
    props.onCancel();
  };
  const handleFinish = async (values: Record<string, any>) => {
    props.onSubmit(values as MenuFormData);
  };

  return (
    <Modal
      width={640}
      title={intl.formatMessage({
        id: 'system.menu.title',
        defaultMessage: '编辑菜单权限',
      })}
      open={props.open}
      forceRender
      destroyOnHidden
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <ProForm
        form={form}
        grid={true}
        submitter={false}
        layout="horizontal"
        onFinish={handleFinish}
        initialValues={{
          parentId: props.values.parentId !== undefined ? props.values.parentId : (!props.values.menuId ? 0 : undefined),
          menuType: props.values.menuType || (!props.values.menuId ? 'M' : undefined),
          orderNum: props.values.orderNum !== undefined ? props.values.orderNum : (!props.values.menuId ? 1 : undefined),
          isFrame: props.values.isFrame !== undefined ? props.values.isFrame : (!props.values.menuId ? '1' : undefined),
          isCache: props.values.isCache !== undefined ? props.values.isCache : (!props.values.menuId ? '0' : undefined),
          visible: props.values.visible !== undefined ? props.values.visible : (!props.values.menuId ? '0' : undefined),
          status: props.values.status !== undefined ? props.values.status : (!props.values.menuId ? '0' : undefined),
        }}>
        <ProFormDigit
          name="menuId"
          label={intl.formatMessage({
            id: 'system.menu.menu_id',
            defaultMessage: '菜单编号',
          })}
          placeholder="请输入菜单编号"
          disabled
          hidden={true}
          rules={[
            {
              required: false,
              message: <FormattedMessage id="请输入菜单编号！" defaultMessage="请输入菜单编号！" />,
            },
          ]}
        />
        <ProFormTreeSelect
          name="parentId"
          label={intl.formatMessage({
            id: 'system.menu.parent_id',
            defaultMessage: '上级菜单',
          })}
          params={{menuTree}}
          request={async () => {
            return menuTree;
          }}
          placeholder="请输入父菜单编号"
          rules={[
            {
              required: true,
              message: <FormattedMessage id="请输入父菜单编号！" defaultMessage="请输入父菜单编号！" />,
            },
          ]}
        />
        <ProFormRadio.Group
          name="menuType"
          valueEnum={{
            M: '目录',
            C: '菜单',
            F: '按钮',
          }}
          label={intl.formatMessage({
            id: 'system.menu.menu_type',
            defaultMessage: '菜单类型',
          })}
          placeholder="请输入菜单类型"
          rules={[
            {
              required: false,
              message: <FormattedMessage id="请输入菜单类型！" defaultMessage="请输入菜单类型！" />,
            },
          ]}
          fieldProps={{
            onChange: (e) => {
              setMenuTypeId(e.target.value);
            },
          }}
        />
        <ProFormSelect
          name="icon"
          label={intl.formatMessage({
            id: 'system.menu.icon',
            defaultMessage: '菜单图标',
          })}
          valueEnum={{}}
          hidden={menuTypeId === 'F'}
          addonBefore={createIcon(menuIconName)}
          fieldProps={{
            onClick: () => {
              setIconSelectorOpen(true);
            },
          }}
          placeholder="请输入菜单图标"
          rules={[
            {
              required: false,
              message: <FormattedMessage id="请输入菜单图标！" defaultMessage="请输入菜单图标！" />,
            },
          ]}
        />
        <ProFormText
          name="menuName"
          label={intl.formatMessage({
            id: 'system.menu.menu_name',
            defaultMessage: '菜单名称',
          })}
          colProps={{ md: 12, xl: 12 }}
          placeholder="请输入菜单名称"
          rules={[
            {
              required: true,
              message: <FormattedMessage id="请输入菜单名称！" defaultMessage="请输入菜单名称！" />,
            },
          ]}
        />
        <ProFormDigit
          name="orderNum"
          label={intl.formatMessage({
            id: 'system.menu.order_num',
            defaultMessage: '显示顺序',
          })}
          width="lg"
          colProps={{ md: 12, xl: 12 }}
          placeholder="请输入显示顺序"
          rules={[
            {
              required: false,
              message: <FormattedMessage id="请输入显示顺序！" defaultMessage="请输入显示顺序！" />,
            },
          ]}
        />
        <ProFormRadio.Group
          name="isFrame"
          valueEnum={{
            0: '是',
            1: '否',
          }}
          label={intl.formatMessage({
            id: 'system.menu.is_frame',
            defaultMessage: '是否为外链',
          })}
          colProps={{ md: 12, xl: 12 }}
          placeholder="请输入是否为外链"
          hidden={menuTypeId === 'F'}
          rules={[
            {
              required: false,
              message: <FormattedMessage id="请输入是否为外链！" defaultMessage="请输入是否为外链！" />,
            },
          ]}
        />
        <ProFormText
          name="path"
          label={intl.formatMessage({
            id: 'system.menu.path',
            defaultMessage: '路由地址',
          })}
          width="lg"
          colProps={{ md: 12, xl: 12 }}
          placeholder="请输入路由地址"
          hidden={menuTypeId === 'F'}
          rules={[
            {
              required: menuTypeId !== 'F',
              message: <FormattedMessage id="请输入路由地址！" defaultMessage="请输入路由地址！" />,
            },
          ]}
        />
        <ProFormText
          name="component"
          label={intl.formatMessage({
            id: 'system.menu.component',
            defaultMessage: '组件路径',
          })}
          colProps={{ md: 12, xl: 12 }}
          placeholder="请输入组件路径"
          hidden={menuTypeId !== 'C'}
          rules={[
            {
              required: false,
              message: <FormattedMessage id="请输入组件路径！" defaultMessage="请输入组件路径！" />,
            },
          ]}
        />
        <ProFormText
          name="query"
          label={intl.formatMessage({
            id: 'system.menu.query',
            defaultMessage: '路由参数',
          })}
          colProps={{ md: 12, xl: 12 }}
          placeholder="请输入路由参数"
          hidden={menuTypeId !== 'C'}
          rules={[
            {
              required: false,
              message: <FormattedMessage id="请输入路由参数！" defaultMessage="请输入路由参数！" />,
            },
          ]}
        />
        <ProFormText
          name="perms"
          label={intl.formatMessage({
            id: 'system.menu.perms',
            defaultMessage: '权限标识',
          })}
          colProps={{ md: 12, xl: 12 }}
          placeholder="请输入权限标识"
          hidden={menuTypeId === 'M'}
          rules={[
            {
              required: false,
              message: <FormattedMessage id="请输入权限标识！" defaultMessage="请输入权限标识！" />,
            },
          ]}
        />
        <ProFormRadio.Group
          name="isCache"
          valueEnum={{
            0: '缓存',
            1: '不缓存',
          }}
          label={intl.formatMessage({
            id: 'system.menu.is_cache',
            defaultMessage: '是否缓存',
          })}
          colProps={{ md: 12, xl: 12 }}
          placeholder="请输入是否缓存"
          hidden={menuTypeId !== 'C'}
          rules={[
            {
              required: false,
              message: <FormattedMessage id="请输入是否缓存！" defaultMessage="请输入是否缓存！" />,
            },
          ]}
        />
        <ProFormRadio.Group
          name="visible"
          valueEnum={visibleOptions}
          label={intl.formatMessage({
            id: 'system.menu.visible',
            defaultMessage: '显示状态',
          })}
          colProps={{ md: 12, xl: 12 }}
          placeholder="请输入显示状态"
          hidden={menuTypeId === 'F'}
          rules={[
            {
              required: false,
              message: <FormattedMessage id="请输入显示状态！" defaultMessage="请输入显示状态！" />,
            },
          ]}
        />
        <ProFormRadio.Group
          valueEnum={statusOptions}
          name="status"
          label={intl.formatMessage({
            id: 'system.menu.status',
            defaultMessage: '菜单状态',
          })}
          colProps={{ md: 12, xl: 12 }}
          placeholder="请输入菜单状态"
          hidden={menuTypeId === 'F'}
          rules={[
            {
              required: true,
              message: <FormattedMessage id="请输入菜单状态！" defaultMessage="请输入菜单状态！" />,
            },
          ]}
        />
      </ProForm>
      <Modal
        width={800}
        open={iconSelectorOpen}
        onCancel={() => {
          setIconSelectorOpen(false);
        }}
        footer={null}
      >
        <IconSelector
          onSelect={(name: string) => {
            form.setFieldsValue({ icon: name });
            setMenuIconName(name);
            setIconSelectorOpen(false);
          }}
        />
      </Modal>
    </Modal>
  );
};

export default MenuForm;
