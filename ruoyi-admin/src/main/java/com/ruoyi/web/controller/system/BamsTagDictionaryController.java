package com.ruoyi.web.controller.system;

import java.util.List;
import jakarta.servlet.http.HttpServletResponse;

import com.ruoyi.common.utils.poi.ExcelUtil;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ruoyi.common.annotation.Log;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.enums.BusinessType;
import com.ruoyi.system.domain.BamsTagDictionary;
import com.ruoyi.system.service.IBamsTagDictionaryService;
import com.ruoyi.common.core.page.TableDataInfo;

/**
 * 标签字典Controller
 *
 * @author ruoyi
 * @date 2025-11-19
 */
@RestController
@RequestMapping("/system/archive/tag")
public class BamsTagDictionaryController extends BaseController
{
    @Autowired
    private IBamsTagDictionaryService bamsTagDictionaryService;

    /**
     * 查询标签字典列表
     */
    @PreAuthorize("@ss.hasPermi('system:tag:list')")
    @GetMapping("/list")
    public TableDataInfo list(BamsTagDictionary bamsTagDictionary)
    {
        startPage();
        List<BamsTagDictionary> list = bamsTagDictionaryService.selectBamsTagDictionaryList(bamsTagDictionary);
        return getDataTable(list);
    }

    /**
     * 查询所有启用的标签（用于下拉选择）
     */
    @GetMapping("/enabled")
    public AjaxResult getEnabledTags()
    {
        List<BamsTagDictionary> list = bamsTagDictionaryService.selectEnabledTags();
        return success(list);
    }

    /**
     * 导出标签字典列表
     */
    @PreAuthorize("@ss.hasPermi('system:tag:export')")
    @Log(title = "标签字典", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(HttpServletResponse response, BamsTagDictionary bamsTagDictionary)
    {
        List<BamsTagDictionary> list = bamsTagDictionaryService.selectBamsTagDictionaryList(bamsTagDictionary);
        ExcelUtil<BamsTagDictionary> util = new ExcelUtil<BamsTagDictionary>(BamsTagDictionary.class);
        util.exportExcel(response, list, "标签字典");
    }

    /**
     * 获取标签字典详细信息
     */
    @PreAuthorize("@ss.hasPermi('system:tag:query')")
    @GetMapping(value = "/{tagId}")
    public AjaxResult getInfo(@PathVariable("tagId") Long tagId)
    {
        return success(bamsTagDictionaryService.selectBamsTagDictionaryByTagId(tagId));
    }

    /**
     * 新增标签字典
     */
    @PreAuthorize("@ss.hasPermi('system:tag:add')")
    @Log(title = "标签字典", businessType = BusinessType.INSERT)
    @PostMapping
    public AjaxResult add(@RequestBody BamsTagDictionary bamsTagDictionary)
    {
        return toAjax(bamsTagDictionaryService.insertBamsTagDictionary(bamsTagDictionary));
    }

    /**
     * 修改标签字典
     */
    @PreAuthorize("@ss.hasPermi('system:tag:edit')")
    @Log(title = "标签字典", businessType = BusinessType.UPDATE)
    @PutMapping
    public AjaxResult edit(@RequestBody BamsTagDictionary bamsTagDictionary)
    {
        return toAjax(bamsTagDictionaryService.updateBamsTagDictionary(bamsTagDictionary));
    }

    /**
     * 删除标签字典
     */
    @PreAuthorize("@ss.hasPermi('system:tag:remove')")
    @Log(title = "标签字典", businessType = BusinessType.DELETE)
    @DeleteMapping("/{tagIds}")
    public AjaxResult remove(@PathVariable Long[] tagIds)
    {
        return toAjax(bamsTagDictionaryService.deleteBamsTagDictionaryByTagIds(tagIds));
    }

    /**
     * 校验标签名称唯一性
     */
    @GetMapping("/checkTagNameUnique/{tagName}")
    public AjaxResult checkTagNameUnique(@PathVariable String tagName)
    {
        boolean unique = bamsTagDictionaryService.checkTagNameUnique(tagName);
        return success(unique);
    }
}
