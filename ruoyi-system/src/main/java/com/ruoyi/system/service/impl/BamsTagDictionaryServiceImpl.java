package com.ruoyi.system.service.impl;

import java.util.Date;
import java.util.List;

import com.ruoyi.common.exception.ServiceException;
import com.ruoyi.common.utils.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.ruoyi.system.mapper.BamsTagDictionaryMapper;
import com.ruoyi.system.domain.BamsTagDictionary;
import com.ruoyi.system.service.IBamsTagDictionaryService;

/**
 * 标签字典Service业务层处理
 *
 * @author ruoyi
 * @date 2025-11-19
 */
@Service
public class BamsTagDictionaryServiceImpl implements IBamsTagDictionaryService
{
    @Autowired
    private BamsTagDictionaryMapper bamsTagDictionaryMapper;

    /**
     * 查询标签字典
     *
     * @param tagId 标签主键
     * @return 标签字典
     */
    @Override
    public BamsTagDictionary selectBamsTagDictionaryByTagId(Long tagId)
    {
        return bamsTagDictionaryMapper.selectBamsTagDictionaryByTagId(tagId);
    }

    /**
     * 根据标签名称查询标签
     *
     * @param tagName 标签名称
     * @return 标签字典
     */
    @Override
    public BamsTagDictionary selectBamsTagDictionaryByTagName(String tagName)
    {
        return bamsTagDictionaryMapper.selectBamsTagDictionaryByTagName(tagName);
    }

    /**
     * 查询标签字典列表
     *
     * @param bamsTagDictionary 标签字典
     * @return 标签字典
     */
    @Override
    public List<BamsTagDictionary> selectBamsTagDictionaryList(BamsTagDictionary bamsTagDictionary)
    {
        return bamsTagDictionaryMapper.selectBamsTagDictionaryList(bamsTagDictionary);
    }

    /**
     * 查询所有启用的标签
     *
     * @return 标签列表
     */
    @Override
    public List<BamsTagDictionary> selectEnabledTags()
    {
        return bamsTagDictionaryMapper.selectEnabledTags();
    }

    /**
     * 新增标签字典
     *
     * @param bamsTagDictionary 标签字典
     * @return 结果
     */
    @Override
    public int insertBamsTagDictionary(BamsTagDictionary bamsTagDictionary)
    {
        // 校验标签名称唯一性
        if (!checkTagNameUnique(bamsTagDictionary.getTagName()))
        {
            throw new ServiceException("标签名称已存在");
        }

        bamsTagDictionary.setUsageCount(0);
        bamsTagDictionary.setStatus("0");
        bamsTagDictionary.setCreateBy(SecurityUtils.getUsername());
        bamsTagDictionary.setCreateTime(new Date());
        return bamsTagDictionaryMapper.insertBamsTagDictionary(bamsTagDictionary);
    }

    /**
     * 修改标签字典
     *
     * @param bamsTagDictionary 标签字典
     * @return 结果
     */
    @Override
    public int updateBamsTagDictionary(BamsTagDictionary bamsTagDictionary)
    {
        BamsTagDictionary existingTag = bamsTagDictionaryMapper.selectBamsTagDictionaryByTagName(
                bamsTagDictionary.getTagName());

        // 如果名称被修改，需要校验新名称的唯一性
        if (existingTag != null && !existingTag.getTagId().equals(bamsTagDictionary.getTagId()))
        {
            throw new ServiceException("标签名称已存在");
        }

        return bamsTagDictionaryMapper.updateBamsTagDictionary(bamsTagDictionary);
    }

    /**
     * 批量删除标签字典
     *
     * @param tagIds 需要删除的数据主键集合
     * @return 结果
     */
    @Override
    public int deleteBamsTagDictionaryByTagIds(Long[] tagIds)
    {
        // 检查标签是否被使用
        for (Long tagId : tagIds)
        {
            BamsTagDictionary tag = bamsTagDictionaryMapper.selectBamsTagDictionaryByTagId(tagId);
            if (tag != null && tag.getUsageCount() > 0)
            {
                throw new ServiceException("标签【" + tag.getTagName() + "】正在使用中，不允许删除");
            }
        }

        return bamsTagDictionaryMapper.deleteBamsTagDictionaryByTagIds(tagIds);
    }

    /**
     * 删除标签字典信息
     *
     * @param tagId 标签主键
     * @return 结果
     */
    @Override
    public int deleteBamsTagDictionaryByTagId(Long tagId)
    {
        BamsTagDictionary tag = bamsTagDictionaryMapper.selectBamsTagDictionaryByTagId(tagId);
        if (tag != null && tag.getUsageCount() > 0)
        {
            throw new ServiceException("标签【" + tag.getTagName() + "】正在使用中，不允许删除");
        }

        return bamsTagDictionaryMapper.deleteBamsTagDictionaryByTagId(tagId);
    }

    /**
     * 校验标签名称是否唯一
     *
     * @param tagName 标签名称
     * @return 结果
     */
    @Override
    public boolean checkTagNameUnique(String tagName)
    {
        BamsTagDictionary tag = bamsTagDictionaryMapper.selectBamsTagDictionaryByTagName(tagName);
        return tag == null;
    }
}
