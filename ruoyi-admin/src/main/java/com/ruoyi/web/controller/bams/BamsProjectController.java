package com.ruoyi.web.controller.bams;

import java.util.List;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ruoyi.common.annotation.Log;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.core.page.TableDataInfo;
import com.ruoyi.common.enums.BusinessType;
import com.ruoyi.common.utils.poi.ExcelUtil;
import com.ruoyi.system.domain.BamsProject;
import com.ruoyi.system.domain.BamsProjectStage;
import com.ruoyi.system.service.IBamsProjectService;

/**
 * 项目信息 信息操作处理
 *
 * @author Rick
 */
@RestController
@RequestMapping("/bams/project")
public class BamsProjectController extends BaseController
{
    @Autowired
    private IBamsProjectService projectService;

    /**
     * 获取项目列表
     */
    @PreAuthorize("@ss.hasPermi('bams:project:list')")
    @GetMapping("/list")
    public TableDataInfo list(BamsProject project)
    {
        startPage();
        List<BamsProject> list = projectService.selectProjectList(project);
        return getDataTable(list);
    }

    /**
     * 根据项目ID获取详细信息
     */
    @PreAuthorize("@ss.hasPermi('bams:project:query')")
    @GetMapping("/{projectId}")
    public AjaxResult getInfo(@PathVariable Long projectId)
    {
        return success(projectService.selectProjectById(projectId));
    }

    /**
     * 根据项目编号查询项目信息
     */
    @PreAuthorize("@ss.hasPermi('bams:project:query')")
    @GetMapping("/code/{projectCode}")
    public AjaxResult getByCode(@PathVariable String projectCode)
    {
        return success(projectService.selectProjectByCode(projectCode));
    }

    /**
     * 查询项目阶段列表
     */
    @PreAuthorize("@ss.hasPermi('bams:project:query')")
    @GetMapping("/stages/{projectId}")
    public AjaxResult getStages(@PathVariable Long projectId)
    {
        List<BamsProjectStage> stages = projectService.selectProjectStages(projectId);
        return success(stages);
    }

    /**
     * 新增项目
     */
    @PreAuthorize("@ss.hasPermi('bams:project:add')")
    @Log(title = "项目信息", businessType = BusinessType.INSERT)
    @PostMapping
    public AjaxResult add(@Validated @RequestBody BamsProject project)
    {
        if (!projectService.checkProjectCodeUnique(project))
        {
            return error("新增项目'" + project.getProjectName() + "'失败，项目编号已存在");
        }
        project.setCreateBy(getUsername());
        return toAjax(projectService.insertProject(project));
    }

    /**
     * 修改项目
     */
    @PreAuthorize("@ss.hasPermi('bams:project:edit')")
    @Log(title = "项目信息", businessType = BusinessType.UPDATE)
    @PostMapping("/update")
    public AjaxResult edit(@Validated @RequestBody BamsProject project)
    {
        project.setUpdateBy(getUsername());
        return toAjax(projectService.updateProject(project));
    }

    /**
     * 删除项目（逻辑删除）
     */
    @PreAuthorize("@ss.hasPermi('bams:project:remove')")
    @Log(title = "项目信息", businessType = BusinessType.DELETE)
    @PostMapping("/delete")
    public AjaxResult remove(@RequestBody Long[] projectIds)
    {
        return toAjax(projectService.deleteProjectByIds(projectIds));
    }

    /**
     * 导出项目列表
     */
    @PreAuthorize("@ss.hasPermi('bams:project:export')")
    @Log(title = "项目信息", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(HttpServletResponse response, @RequestBody BamsProject project)
    {
        List<BamsProject> list = projectService.selectProjectList(project);
        ExcelUtil<BamsProject> util = new ExcelUtil<BamsProject>(BamsProject.class);
        util.exportExcel(response, list, "项目信息数据");
    }
}
