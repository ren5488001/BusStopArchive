package com.ruoyi.web.controller.bams;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.ruoyi.common.annotation.Log;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.core.page.TableDataInfo;
import com.ruoyi.common.enums.BusinessType;
import com.ruoyi.system.domain.BamsStageTemplate;
import com.ruoyi.system.service.IBamsStageTemplateService;

/**
 * 项目阶段模板 信息操作处理
 *
 * @author Rick
 */
@RestController
@RequestMapping("/bams/stage/template")
public class BamsStageTemplateController extends BaseController
{
    @Autowired
    private IBamsStageTemplateService templateService;

    /**
     * 获取阶段模板列表
     */
    @GetMapping("/list")
    public TableDataInfo list(BamsStageTemplate template)
    {
        startPage();
        List<BamsStageTemplate> list = templateService.selectTemplateList(template);
        return getDataTable(list);
    }

    /**
     * 根据模板ID获取详细信息
     */
    @GetMapping(value = "/{templateId}")
    public AjaxResult getInfo(@PathVariable Long templateId)
    {
        return success(templateService.selectTemplateById(templateId));
    }

    /**
     * 新增阶段模板
     */
    @PreAuthorize("@ss.hasPermi('bams:template:add')")
    @Log(title = "阶段模板", businessType = BusinessType.INSERT)
    @PostMapping
    public AjaxResult add(@Validated @RequestBody BamsStageTemplate template)
    {
        return toAjax(templateService.insertTemplate(template));
    }

    /**
     * 修改阶段模板
     */
    @PreAuthorize("@ss.hasPermi('bams:template:edit')")
    @Log(title = "阶段模板", businessType = BusinessType.UPDATE)
    @PutMapping
    public AjaxResult edit(@Validated @RequestBody BamsStageTemplate template)
    {
        return toAjax(templateService.updateTemplate(template));
    }

    /**
     * 删除阶段模板
     */
    @PreAuthorize("@ss.hasPermi('bams:template:remove')")
    @Log(title = "阶段模板", businessType = BusinessType.DELETE)
    @DeleteMapping("/{templateIds}")
    public AjaxResult remove(@PathVariable Long[] templateIds)
    {
        return toAjax(templateService.deleteTemplateByIds(templateIds));
    }

    /**
     * 复制阶段模板
     */
    @PreAuthorize("@ss.hasPermi('bams:template:copy')")
    @Log(title = "阶段模板", businessType = BusinessType.INSERT)
    @PostMapping("/copy/{templateId}")
    public AjaxResult copy(@PathVariable Long templateId, @RequestParam(required = false) String newName)
    {
        Long newTemplateId = templateService.copyTemplate(templateId, newName);
        return success(newTemplateId);
    }
}
