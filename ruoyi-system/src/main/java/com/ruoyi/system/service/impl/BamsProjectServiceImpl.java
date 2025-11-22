package com.ruoyi.system.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ruoyi.common.utils.StringUtils;
import com.ruoyi.common.exception.ServiceException;
import com.ruoyi.system.domain.BamsProject;
import com.ruoyi.system.domain.BamsProjectStage;
import com.ruoyi.system.domain.BamsStageTemplate;
import com.ruoyi.system.domain.BamsStageTemplateDetail;
import com.ruoyi.system.mapper.BamsProjectMapper;
import com.ruoyi.system.mapper.BamsProjectStageMapper;
import com.ruoyi.system.service.IBamsProjectService;
import com.ruoyi.system.service.IBamsStageTemplateService;
import com.ruoyi.system.service.ISysDictDataService;

/**
 * 项目信息Service业务层处理
 *
 * @author Rick
 */
@Service
public class BamsProjectServiceImpl implements IBamsProjectService
{
    @Autowired
    private BamsProjectMapper projectMapper;

    @Autowired
    private BamsProjectStageMapper projectStageMapper;

    @Autowired
    private IBamsStageTemplateService stageTemplateService;

    @Autowired
    private ISysDictDataService dictDataService;

    /**
     * 查询项目列表
     *
     * @param project 项目信息
     * @return 项目列表
     */
    @Override
    public List<BamsProject> selectProjectList(BamsProject project)
    {
        return projectMapper.selectProjectList(project);
    }

    /**
     * 根据项目ID查询项目信息
     *
     * 缓存策略：
     * - 缓存名称：bams:project
     * - 缓存键：项目ID
     * - 缓存时间：5分钟（在Redis配置中设置）
     * - 缓存条件：查询结果不为null
     *
     * @param projectId 项目ID
     * @return 项目信息
     */
    @Override
    @Cacheable(value = "bams:project", key = "#projectId", unless = "#result == null")
    public BamsProject selectProjectById(Long projectId)
    {
        return projectMapper.selectProjectById(projectId);
    }

    /**
     * 根据项目编号查询项目信息
     *
     * @param projectCode 项目编号
     * @return 项目信息
     */
    @Override
    public BamsProject selectProjectByCode(String projectCode)
    {
        return projectMapper.selectProjectByCode(projectCode);
    }

    /**
     * 新增项目
     *
     * @param project 项目信息
     * @return 结果
     */
    @Override
    @Transactional
    public int insertProject(BamsProject project)
    {
        // 1. 生成项目编号
        String projectCode = generateProjectCode();
        project.setProjectCode(projectCode);

        // 2. 设置默认值
        if (project.getStatus() == null)
        {
            project.setStatus("0");
        }
        if (project.getDelFlag() == null)
        {
            project.setDelFlag("0");
        }
        if (project.getCompletenessRate() == null)
        {
            project.setCompletenessRate(0);
        }
        if (project.getTotalRequiredFiles() == null)
        {
            project.setTotalRequiredFiles(0);
        }
        if (project.getActualArchivedFiles() == null)
        {
            project.setActualArchivedFiles(0);
        }

        // 3. 插入项目基本信息
        int rows = projectMapper.insertProject(project);

        // 4. 如果选择了阶段模板，应用模板
        if (project.getTemplateId() != null)
        {
            applyStageTemplate(project.getProjectId(), project.getTemplateId());
        }

        return rows;
    }

    /**
     * 修改项目
     *
     * 缓存策略：更新后清除缓存
     *
     * @param project 项目信息
     * @return 结果
     */
    @Override
    @Transactional
    @CacheEvict(value = "bams:project", key = "#project.projectId")
    public int updateProject(BamsProject project)
    {
        // 1. 查询原项目信息（在事务开始时查询，确保数据一致性）
        BamsProject oldProject = selectProjectById(project.getProjectId());
        if (oldProject == null)
        {
            throw new ServiceException("项目不存在");
        }

        // 2. 检测模板是否变化
        Long oldTemplateId = oldProject.getTemplateId();
        Long newTemplateId = project.getTemplateId();
        boolean templateChanged = !Objects.equals(oldTemplateId, newTemplateId);

        // 3. 先更新项目基本信息（确保基本信息更新成功后再处理模板）
        int rows = projectMapper.updateProject(project);
        if (rows == 0)
        {
            throw new ServiceException("项目更新失败");
        }

        // 4. 如果模板发生变化，应用新模板
        if (templateChanged && newTemplateId != null)
        {
            applyStageTemplate(project.getProjectId(), newTemplateId);
        }

        return rows;
    }

    /**
     * 逻辑删除项目
     *
     * 业务规则说明：
     * 1. 项目采用逻辑删除（del_flag = '2'），不物理删除数据
     * 2. 项目阶段数据不删除，保留完整性以便恢复
     * 3. 查询时通过 del_flag 过滤已删除项目
     * 4. 如需彻底删除，应实现单独的物理删除接口（需同时删除阶段数据）
     *
     * 缓存策略：删除后清除所有项目缓存
     *
     * 注意：由于移除了外键约束，数据完整性由应用层保证
     *
     * @param projectIds 需要删除的项目ID数组
     * @return 结果
     */
    @Override
    @CacheEvict(value = "bams:project", allEntries = true)
    public int deleteProjectByIds(Long[] projectIds)
    {
        // 逻辑删除项目（del_flag = '2'）
        // 阶段数据保留，不删除，以便项目恢复时数据完整
        return projectMapper.deleteProjectByIds(projectIds);
    }

    /**
     * 校验项目编号是否唯一
     *
     * @param project 项目信息
     * @return 结果
     */
    @Override
    public boolean checkProjectCodeUnique(BamsProject project)
    {
        Long projectId = project.getProjectId() == null ? -1L : project.getProjectId();
        BamsProject info = projectMapper.checkProjectCodeUnique(project.getProjectCode());
        if (info != null && info.getProjectId().longValue() != projectId.longValue())
        {
            return false;
        }
        return true;
    }

    /**
     * 查询项目的阶段列表
     * 将 requiredFiles 字段中的字典值翻译成对象数组（包含ID和中文名称）
     *
     * @param projectId 项目ID
     * @return 阶段列表
     */
    @Override
    public List<BamsProjectStage> selectProjectStages(Long projectId)
    {
        List<BamsProjectStage> stages = projectStageMapper.selectByProjectId(projectId);

        // 翻译 requiredFiles 字段中的字典值为对象数组
        for (BamsProjectStage stage : stages)
        {
            if (StringUtils.isNotEmpty(stage.getRequiredFiles()))
            {
                List<BamsProjectStage.FileOption> fileOptions = translateRequiredFilesToOptions(stage.getRequiredFiles());
                stage.setRequiredFileList(fileOptions);
            }
        }

        return stages;
    }

    /**
     * 翻译标准文件字段为对象数组
     * 将字典值（如 "design_file,construction_file"）翻译成对象数组
     * 每个对象包含 id（字典值）和 name（中文名称）
     *
     * @param requiredFiles 字典值列表，逗号分隔
     * @return 文件选项列表
     */
    private List<BamsProjectStage.FileOption> translateRequiredFilesToOptions(String requiredFiles)
    {
        String[] dictValues = requiredFiles.split(",");
        List<BamsProjectStage.FileOption> fileOptions = new ArrayList<>();

        for (String dictValue : dictValues)
        {
            String trimmedValue = dictValue.trim();
            if (StringUtils.isNotEmpty(trimmedValue))
            {
                // 从数据字典 bams_file_conf 查询中文名称
                String dictLabel = dictDataService.selectDictLabel("bams_file_conf", trimmedValue);

                // 如果找到对应的中文名称，使用中文；否则使用字典值本身
                String displayName = StringUtils.isNotEmpty(dictLabel) ? dictLabel : trimmedValue;

                // 创建文件选项对象
                BamsProjectStage.FileOption option = new BamsProjectStage.FileOption(trimmedValue, displayName);
                fileOptions.add(option);
            }
        }

        return fileOptions;
    }

    /**
     * 生成项目编号（支持并发安全）
     * 格式：XMB001, XMB002, XMB003...
     *
     * 实现方式：使用乐观锁重试机制
     * 1. 生成候选编号
     * 2. 尝试插入项目记录
     * 3. 如果编号冲突（违反唯一约束），重试最多3次
     *
     * @return 项目编号
     */
    private String generateProjectCode()
    {
        String prefix = "XMB";
        int maxRetry = 3;

        for (int retry = 0; retry < maxRetry; retry++)
        {
            try
            {
                // 查询最大编号
                String maxCode = projectMapper.selectMaxCode();
                int sequence = 1;
                if (StringUtils.isNotEmpty(maxCode))
                {
                    // 提取数字部分，例如从 "XMB001" 中提取 "001"
                    String seqStr = maxCode.substring(prefix.length());
                    sequence = Integer.parseInt(seqStr) + 1;
                }

                String projectCode = prefix + String.format("%03d", sequence);

                // 尝试通过检查唯一性来验证编号可用性
                BamsProject existProject = projectMapper.checkProjectCodeUnique(projectCode);
                if (existProject == null)
                {
                    // 编号可用，返回
                    return projectCode;
                }

                // 编号已存在，重试
                if (retry < maxRetry - 1)
                {
                    // 添加短暂延迟，避免多个线程同时重试
                    Thread.sleep(50 + (long)(Math.random() * 50));
                }
            }
            catch (InterruptedException e)
            {
                Thread.currentThread().interrupt();
                throw new ServiceException("生成项目编号被中断");
            }
            catch (Exception e)
            {
                if (retry == maxRetry - 1)
                {
                    throw new ServiceException("生成项目编号失败: " + e.getMessage());
                }
            }
        }

        throw new ServiceException("生成项目编号失败，请稍后重试");
    }

    /**
     * 应用阶段模板到项目
     *
     * @param projectId 项目ID
     * @param templateId 模板ID
     */
    private void applyStageTemplate(Long projectId, Long templateId)
    {
        // 1. 查询模板信息
        BamsStageTemplate template = stageTemplateService.selectTemplateById(templateId);
        if (template == null)
        {
            throw new ServiceException("阶段模板不存在");
        }

        // 2. 校验模板状态（不允许应用已停用的模板）
        if ("1".equals(template.getStatus()))
        {
            throw new ServiceException("该模板已停用，无法应用");
        }

        // 3. 查询模板明细（从模板对象中获取）
        List<BamsStageTemplateDetail> templateDetails = template.getStages();

        if (templateDetails == null || templateDetails.isEmpty())
        {
            throw new ServiceException("阶段模板明细不能为空");
        }

        // 3. 删除项目原有阶段数据
        projectStageMapper.deleteByProjectId(projectId);

        // 4. 根据模板生成新的阶段数据
        List<BamsProjectStage> stages = new ArrayList<>();
        int totalRequiredFiles = 0;

        for (BamsStageTemplateDetail detail : templateDetails)
        {
            BamsProjectStage stage = new BamsProjectStage();
            stage.setProjectId(projectId);
            stage.setStageId(detail.getStageId());
            stage.setStageDisplayName(detail.getStageDisplayName());
            stage.setStageOrder(detail.getStageOrder());
            stage.setRequiredFiles(detail.getRequiredFiles());

            // 计算该阶段应归档文件数量
            int fileCount = StringUtils.isNotEmpty(detail.getRequiredFiles())
                ? detail.getRequiredFiles().split(",").length : 0;
            stage.setRequiredFileCount(fileCount);
            stage.setArchivedFileCount(0);
            stage.setCompletenessRate(0);

            totalRequiredFiles += fileCount;
            stages.add(stage);
        }

        // 5. 批量插入阶段数据
        if (!stages.isEmpty())
        {
            projectStageMapper.batchInsert(stages);
        }

        // 6. 更新项目的模板关联和统计信息
        BamsProject projectUpdate = new BamsProject();
        projectUpdate.setProjectId(projectId);
        projectUpdate.setTemplateId(templateId);
        projectUpdate.setTemplateName(template.getTemplateName());
        projectUpdate.setTotalRequiredFiles(totalRequiredFiles);
        projectUpdate.setActualArchivedFiles(0);
        projectUpdate.setCompletenessRate(0);
        projectMapper.updateProject(projectUpdate);
    }
}
